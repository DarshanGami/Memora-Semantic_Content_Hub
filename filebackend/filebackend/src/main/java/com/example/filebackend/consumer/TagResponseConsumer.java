package com.example.filebackend.consumer;

import com.example.filebackend.model.Note;
import com.example.filebackend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Component
@EnableKafka
public class TagResponseConsumer {

    @Autowired
    private NoteRepository noteRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "tag-response", groupId = "main-backend-consumer")
    public void consume(String message) {
        try {
            Map<String, Object> map = objectMapper.readValue(message, Map.class);

            String contentId = (String) map.get("content_id");
            List<String> tags = ((List<?>) map.get("tags")).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());

            Note note = noteRepository.findById(contentId).orElse(null);
            if (note != null) {
                note.setTags(tags);
                noteRepository.save(note);
                System.out.println("✅ Updated note with tags: " + contentId);
            } else {
                System.out.println("❌ Note not found for content_id: " + contentId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
