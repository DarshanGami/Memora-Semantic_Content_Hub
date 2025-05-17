package com.example.filebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private static final String TAG_REQUEST_TOPIC = "tag-request";

    public void sendTagRequest(String contentId, String contentType, String text, List<String> customTags) {
        if ("document".equalsIgnoreCase(contentType)) {
            System.out.println("Skipping tag request for document: " + contentId);
            return;
        }

        String tagsJson = (customTags != null) ? customTags.toString() : "[]";

        String message = String.format(
                "{ \"content_id\": \"%s\", \"content_type\": \"%s\", \"text\": \"%s\", \"tags\": %s }",
                contentId,
                contentType,
                text.replace("\"", "\\\""),
                tagsJson
        );

        kafkaTemplate.send(TAG_REQUEST_TOPIC, message);
        System.out.println("Sent tag request for " + contentType + ": " + contentId);
    }
}

