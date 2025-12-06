package com.nocountry.backend.controller.webhook;

import com.nocountry.backend.services.whatsapp.WhatsAppApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/whatsapp")
@RequiredArgsConstructor
public class WhatsappWebhookController {

    private final WhatsAppApiService whatsAppApiService;

    // Token de verificación configurado en Meta y en tu application.properties
    @Value("${whatsapp.webhook.verify-token}")
    private String VERIFY_TOKEN;

    // ==========================================
    // 1. VERIFICACIÓN DE WEBHOOK (GET)
    // Usado por Meta para validar que el endpoint sea legítimo y nuestro.
    // ==========================================

    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        // Verifica si el modo es 'subscribe' y el token coincide
        if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
            // Si la verificación es exitosa, devolvemos el 'challenge'
            return ResponseEntity.ok(challenge);
        }

        // Si no pasa la verificación de seguridad
        return new ResponseEntity<>("Error: Token verification failed", HttpStatus.FORBIDDEN);
    }

    // ==========================================
    // 2. RECEPCIÓN DE MENSAJES (POST)
    // Recibe los datos de los mensajes INBOUND del Lead.
    // ==========================================

    @PostMapping
    public ResponseEntity<String> receiveMessage(@RequestBody Map<String, Object> payload) {

        // La validación de JSON y la lógica de negocio se delega al servicio de la API
        whatsAppApiService.processInboundWebhook(payload);

        // Meta requiere una respuesta 200 OK para confirmar la recepción
        return ResponseEntity.ok("Message received and processed.");
    }
}