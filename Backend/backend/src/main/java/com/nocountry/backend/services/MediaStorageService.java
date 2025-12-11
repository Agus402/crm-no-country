package com.nocountry.backend.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Service for storing and retrieving media files locally.
 * Files are stored in a configurable directory with UUID-based filenames.
 */
@Service
@Slf4j
public class MediaStorageService {

    private final Path mediaStoragePath;
    private final String baseUrl;

    public MediaStorageService(
            @Value("${media.storage.location:./media-storage}") String storagePath,
            @Value("${APP_BASE_URL:${app.base-url:http://localhost:8080}}") String baseUrl) {
        this.mediaStoragePath = Paths.get(storagePath).toAbsolutePath().normalize();
        // Remove trailing slash if present
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

        try {
            Files.createDirectories(this.mediaStoragePath);
            log.info("📁 Media storage initialized at: {}", this.mediaStoragePath);
            log.info("📁 Media base URL: {}", this.baseUrl);
        } catch (IOException e) {
            throw new RuntimeException("Could not create media storage directory", e);
        }
    }

    /**
     * Stores a file uploaded through the frontend.
     * If the file is a WebM audio, it will be converted to OGG/Opus for WhatsApp
     * compatibility.
     * 
     * @param file The uploaded file
     * @return Map with url (public URL) and filename (original name)
     */
    public Map<String, String> storeFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String contentType = file.getContentType();
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path targetPath = mediaStoragePath.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        log.info("📤 File stored: {} -> {} (type: {})", originalFilename, storedFilename, contentType);

        // Convert WebM audio to OGG for WhatsApp compatibility
        if (isWebmAudio(contentType, extension)) {
            log.info("🔄 Converting WebM audio to OGG for WhatsApp compatibility...");
            try {
                Map<String, String> converted = convertWebmToOgg(targetPath, storedFilename);
                // Delete the original WebM file
                Files.deleteIfExists(targetPath);
                return converted;
            } catch (Exception e) {
                log.error("❌ Failed to convert audio, using original WebM: {}", e.getMessage());
                // Fall through to return original file
            }
        }

        String publicUrl = baseUrl + "/api/media/" + storedFilename;

        return Map.of(
                "url", publicUrl,
                "filename", originalFilename != null ? originalFilename : storedFilename,
                "storedFilename", storedFilename,
                "mimeType", contentType != null ? contentType : "application/octet-stream");
    }

    /**
     * Checks if the file is a WebM audio file that needs conversion.
     */
    private boolean isWebmAudio(String contentType, String extension) {
        if (contentType != null && contentType.contains("audio") && contentType.contains("webm")) {
            return true;
        }
        if (extension != null && extension.equalsIgnoreCase(".webm")) {
            // Check if it's audio by content type or assume it might be
            return contentType != null && contentType.startsWith("audio/");
        }
        return false;
    }

    /**
     * Converts a WebM audio file to OGG/Opus format using FFmpeg.
     * This is required for WhatsApp voice message compatibility.
     */
    private Map<String, String> convertWebmToOgg(Path webmPath, String originalFilename)
            throws IOException, InterruptedException {

        String baseName = originalFilename.replaceFirst("\\.[^.]+$", "");
        String oggFilename = baseName + ".ogg";
        Path oggPath = mediaStoragePath.resolve(oggFilename);

        // FFmpeg command to convert WebM/Opus to OGG/Opus
        // -y: overwrite output, -i: input, -c:a copy: copy audio codec (no re-encoding)
        // -f ogg: force OGG output format
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y",
                "-i", webmPath.toString(),
                "-c:a", "libopus", // Use Opus codec
                "-b:a", "64k", // Bitrate for voice
                "-ar", "48000", // Sample rate
                "-ac", "1", // Mono (required for WhatsApp voice messages)
                "-f", "ogg",
                oggPath.toString());

        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Read output for debugging
        String output = new String(process.getInputStream().readAllBytes());
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            log.error("FFmpeg conversion failed (exit code {}): {}", exitCode, output);
            throw new IOException("FFmpeg conversion failed with exit code: " + exitCode);
        }

        log.info("✅ Audio converted successfully: {} -> {}", originalFilename, oggFilename);

        String publicUrl = baseUrl + "/api/media/" + oggFilename;

        return Map.of(
                "url", publicUrl,
                "filename", oggFilename,
                "storedFilename", oggFilename,
                "mimeType", "audio/ogg");
    }

    /**
     * Downloads a media file from WhatsApp API and stores it locally.
     * 
     * @param mediaId     The WhatsApp media ID
     * @param mimeType    The MIME type of the file
     * @param accessToken The WhatsApp API access token
     * @return Map with url (public URL), filename, and mimeType
     */
    public Map<String, String> downloadAndStoreWhatsAppMedia(
            String mediaId,
            String mimeType,
            String accessToken) throws IOException, InterruptedException {

        HttpClient httpClient = HttpClient.newHttpClient();

        // Step 1: Get the download URL from WhatsApp
        String graphApiUrl = "https://graph.facebook.com/v18.0/" + mediaId;

        HttpRequest urlRequest = HttpRequest.newBuilder()
                .uri(URI.create(graphApiUrl))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> urlResponse = httpClient.send(urlRequest, HttpResponse.BodyHandlers.ofString());

        if (urlResponse.statusCode() != 200) {
            log.error("Failed to get media URL from WhatsApp: {}", urlResponse.body());
            throw new IOException("Failed to get media URL: " + urlResponse.statusCode());
        }

        // Parse the response to get the URL
        String responseBody = urlResponse.body();
        String downloadUrl = extractUrlFromResponse(responseBody);

        if (downloadUrl == null) {
            throw new IOException("Could not extract download URL from WhatsApp response");
        }

        log.info("📥 Downloading media from WhatsApp: {}", mediaId);

        // Step 2: Download the actual file
        HttpRequest downloadRequest = HttpRequest.newBuilder()
                .uri(URI.create(downloadUrl))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<InputStream> downloadResponse = httpClient.send(
                downloadRequest,
                HttpResponse.BodyHandlers.ofInputStream());

        if (downloadResponse.statusCode() != 200) {
            throw new IOException("Failed to download media: " + downloadResponse.statusCode());
        }

        // Step 3: Store the file locally
        String extension = getExtensionFromMimeType(mimeType);
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetPath = mediaStoragePath.resolve(storedFilename);

        try (InputStream inputStream = downloadResponse.body()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        String publicUrl = baseUrl + "/api/media/" + storedFilename;

        log.info("📥 WhatsApp media stored: {} -> {}", mediaId, storedFilename);

        return Map.of(
                "url", publicUrl,
                "filename", storedFilename,
                "storedFilename", storedFilename,
                "mimeType", mimeType != null ? mimeType : "application/octet-stream");
    }

    /**
     * Retrieves a stored file's path by filename.
     */
    public Path getFilePath(String filename) {
        return mediaStoragePath.resolve(filename).normalize();
    }

    /**
     * Checks if a file exists in storage.
     */
    public boolean fileExists(String filename) {
        return Files.exists(getFilePath(filename));
    }

    /**
     * Deletes a file from storage.
     */
    public boolean deleteFile(String filename) {
        try {
            return Files.deleteIfExists(getFilePath(filename));
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filename, e);
            return false;
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String getExtensionFromMimeType(String mimeType) {
        if (mimeType == null)
            return "";

        return switch (mimeType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "video/mp4" -> ".mp4";
            case "video/3gpp" -> ".3gp";
            case "audio/aac" -> ".aac";
            case "audio/mp4" -> ".m4a";
            case "audio/mpeg" -> ".mp3";
            case "audio/amr" -> ".amr";
            case "audio/ogg" -> ".ogg";
            case "application/pdf" -> ".pdf";
            case "application/vnd.ms-powerpoint" -> ".ppt";
            case "application/msword" -> ".doc";
            case "application/vnd.ms-excel" -> ".xls";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> ".docx";
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" -> ".xlsx";
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation" -> ".pptx";
            default -> "";
        };
    }

    private String extractUrlFromResponse(String jsonResponse) {
        // Simple extraction - in production use a proper JSON parser
        int urlIndex = jsonResponse.indexOf("\"url\"");
        if (urlIndex == -1)
            return null;

        int colonIndex = jsonResponse.indexOf(":", urlIndex);
        int startQuote = jsonResponse.indexOf("\"", colonIndex + 1);
        int endQuote = jsonResponse.indexOf("\"", startQuote + 1);

        if (startQuote == -1 || endQuote == -1)
            return null;

        String url = jsonResponse.substring(startQuote + 1, endQuote);
        // Unescape unicode characters
        return url.replace("\\u0025", "%")
                .replace("\\/", "/");
    }
}
