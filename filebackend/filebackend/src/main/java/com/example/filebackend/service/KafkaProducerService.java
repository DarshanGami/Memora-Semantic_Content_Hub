package com.example.filebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "tag-request";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendTagRequest(String message) {
        System.out.println("📤 Sending Kafka message: " + message);  // ✅ Add this
        kafkaTemplate.send(TOPIC, message);
    }

}
