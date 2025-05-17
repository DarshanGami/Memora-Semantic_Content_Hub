package com.example.filebackend.consumer;

import com.example.filebackend.model.FileMetadata;
import com.example.filebackend.model.Link;
import com.example.filebackend.model.Note;
import com.example.filebackend.repository.FileMetadataRepository;
import com.example.filebackend.repository.LinkRepository;
import com.example.filebackend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Component
@EnableKafka
public class TagResponseConsumer {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private FileMetadataRepository fileMetadataRepository;

    @Autowired(required = false) // in case you don't have LinkRepository yet
    private LinkRepository linkRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "tag-response", groupId = "main-backend-consumer")
    public void consume(String message) {
        try {
            Map<String, Object> map = objectMapper.readValue(message, Map.class);
            String contentId = (String) map.get("content_id");
            String contentType = ((String) map.get("content_type")).toLowerCase();
            List<String> tags = ((List<?>) map.get("tags")).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());

            switch (contentType) {
                case "note":
                    Optional<Note> noteOpt = noteRepository.findById(contentId);
                    if (noteOpt.isPresent()) {
                        Note note = noteOpt.get();
                        note.setTags(tags);
                        noteRepository.save(note);
                        System.out.println("✅ Updated tags for note: " + contentId);
                    } else {
                        System.out.println("❌ Note not found: " + contentId);
                    }
                    break;

                case "image":
                    Optional<FileMetadata> fileOpt = fileMetadataRepository.findById(contentId);
                    if (fileOpt.isPresent()) {
                        FileMetadata file = fileOpt.get();
                        file.setTags(tags);
                        fileMetadataRepository.save(file);
                        System.out.println("✅ Updated tags for image: " + contentId);
                    } else {
                        System.out.println("❌ Image not found: " + contentId);
                    }
                    break;

                case "link":
                    if (linkRepository != null) {
                        Optional<Link> linkOpt = linkRepository.findById(contentId);
                        if (linkOpt.isPresent()) {
                            Link link = linkOpt.get();
                            link.setTags(tags);
                            linkRepository.save(link);
                            System.out.println("✅ Updated tags for link: " + contentId);
                        } else {
                            System.out.println("❌ Link not found: " + contentId);
                        }
                    } else {
                        System.out.println("❌ Link repository not configured");
                    }
                    break;

                case "document":
                    // Skip document - no AI-generated tags to update
                    System.out.println("⚠️ Skipping tag update for document: " + contentId);
                    break;

                default:
                    System.out.println("❌ Unknown content type: " + contentType);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
