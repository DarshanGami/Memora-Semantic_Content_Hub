package com.example.filebackend.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

//import java.net.http.HttpHeaders;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiBackendService {

    private final RestTemplate restTemplate;

    public AiBackendService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    // ✅ Used to call AI backend to generate and store vector for custom tag
    public void generateAndStoreCustomTagVectors(String contentType, String contentId, String customTag) {
        String endpoint;
        switch(contentType.toLowerCase()) {
            case "note" -> endpoint = "/api/add/note-tag";
            case "file", "image", "document" -> endpoint = "/api/add/image-tag";
            case "link" -> endpoint = "/api/add/link-tag";
            default -> {
                System.err.println("Unsupported content type");
                return;
            }
        }

        String aiBackendUrl = "http://localhost:5000" + endpoint;

        Map<String, String> payload = new HashMap<>();
        if (contentType.equalsIgnoreCase("note")) {
            payload.put("note_id", contentId);
        } else {
            payload.put("content_id", contentId);  // For link, file, image, document
        }
        payload.put("custom_tag", customTag);

        try {
            restTemplate.postForEntity(aiBackendUrl, payload, Void.class);
            System.out.println("Successfully called AI backend for custom tag vector generation.");
        } catch (Exception e) {
            System.err.println("Failed to call AI backend: " + e.getMessage());
        }
    }

    // ✅ Used to delete vector for a tag from AI backend
    public boolean deleteTagVector(String contentType, String contentId, String customTag) {
        String endpoint;
        switch (contentType.toLowerCase()) {
            case "note" -> endpoint = "/api/delete/note-tag";
            case "link" -> endpoint = "/api/delete/link-tag";
            case "file", "image", "document" -> endpoint = "/api/delete/image-tag";
            default -> {
                System.err.println("Unsupported content type for deletion");
                return false;
            }
        }

        String aiBackendUrl = "http://localhost:5000" + endpoint;

        Map<String, String> payload = new HashMap<>();
        if (contentType.equalsIgnoreCase("note")) {
            payload.put("note_id", contentId);
        } else {
            payload.put("content_id", contentId);
        }
        payload.put("custom_tag", customTag);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON); // ✅ use correct Spring HttpHeaders
        HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);

        try {
            restTemplate.exchange(aiBackendUrl, HttpMethod.DELETE, request, Void.class); // ✅ DELETE request
            System.out.println("Successfully deleted tag vector from AI backend");
            return true;
        } catch (Exception e) {
            System.err.println("Failed to delete tag vector from AI backend: " + e.getMessage());
            return false;
        }
    }

    // ✅ Expose RestTemplate for direct use if needed in controller
    public RestOperations getRestTemplate() {
        return restTemplate;
    }
}
