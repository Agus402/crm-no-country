package com.nocountry.backend.controller;

import com.nocountry.backend.services.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

/**
 * Controller for handling media file uploads and downloads.
 */
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final MediaStorageService mediaStorageService;

    /**
     * Upload a media file.
     * Returns the public URL and file information.
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
        }

        // Validate file size (100 MB max for documents per WhatsApp limits)
        long maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size exceeds maximum allowed (100 MB)"));
        }

        // Validate content type
        String contentType = file.getContentType();
        if (!isAllowedContentType(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File type not allowed: " + contentType));
        }

        try {
            Map<String, String> result = mediaStorageService.storeFile(file);
            log.info("📤 Media uploaded: {}", result.get("filename"));
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to store file"));
        }
    }

    /**
     * Serve a media file by filename.
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveMedia(@PathVariable String filename) {
        try {
            Path filePath = mediaStorageService.getFilePath(filename);

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Invalid file path: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("Error reading file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete a media file.
     */
    @DeleteMapping("/{filename:.+}")
    public ResponseEntity<Map<String, Object>> deleteMedia(@PathVariable String filename) {
        boolean deleted = mediaStorageService.deleteFile(filename);

        if (deleted) {
            log.info("🗑️ Media deleted: {}", filename);
            return ResponseEntity.ok(Map.of("deleted", true, "filename", filename));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private boolean isAllowedContentType(String contentType) {
        if (contentType == null)
            return false;

        return contentType.startsWith("image/") ||
                contentType.startsWith("video/") ||
                contentType.startsWith("audio/") ||
                contentType.equals("application/pdf") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.ms-excel") ||
                contentType.equals("application/vnd.ms-powerpoint") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    }
}
