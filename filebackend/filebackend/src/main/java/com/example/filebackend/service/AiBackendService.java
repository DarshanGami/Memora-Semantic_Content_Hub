package com.example.filebackend.service;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiBackendService {

    private final RestTemplate restTemplate;

    public AiBackendService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public void generateAndStoreCustomTagVectors(String contentType, String contentId, String customTag) {
        String endpoint;
        switch(contentType.toLowerCase()) {
            case "note": endpoint = "/api/add/note-tag"; break;
            case "file":
            case "image":
            case "document": endpoint = "/api/add/image-tag"; break;
            case "link": endpoint = "/api/add/link-tag"; break;
            default:
                System.err.println("Unsupported content type");
                return;
        }

        String aiBackendUrl = "http://localhost:5000" + endpoint;

        Map<String, String> payload = new HashMap<>();
        if(contentType.equalsIgnoreCase("note")) {
            payload.put("note_id", contentId);
        } else if (contentType.equalsIgnoreCase("link")) {
            payload.put("link_id", contentId);
        } else {
            payload.put("image_id", contentId);  // for files/images/documents
        }
        payload.put("custom_tag", customTag);

        try {
            restTemplate.postForEntity(aiBackendUrl, payload, Void.class);
            System.out.println("Successfully called AI backend for custom tag vector generation.");
        } catch (Exception e) {
            System.err.println("Failed to call AI backend: " + e.getMessage());
        }
    }

}

