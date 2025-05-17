package com.example.filebackend.controller;

import com.example.filebackend.repository.FileMetadataRepository;
import com.example.filebackend.repository.LinkRepository;
import com.example.filebackend.repository.NoteRepository;
import com.example.filebackend.service.AiBackendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class CustomTagController {

    private final NoteRepository noteRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final LinkRepository linkRepository;
    private final AiBackendService aiBackendService;  // Internal service to call AI backend

    @PatchMapping("/{contentType}/{contentId}/custom-tags")
    public ResponseEntity<?> addCustomTags(
            @PathVariable String contentType,
            @PathVariable String contentId,
            @RequestBody Map<String, String> requestBody
    ) {
        String customTag = requestBody.get("customTag");
        if (customTag == null || customTag.isEmpty()) {
            return ResponseEntity.badRequest().body("customTag cannot be empty");
        }

        // Validate content exists
        boolean exists = switch (contentType.toLowerCase()) {
            case "note" -> noteRepository.existsById(contentId);
            case "file", "image", "document" -> fileMetadataRepository.existsById(contentId);
            case "link" -> linkRepository.existsById(contentId);
            default -> false;
        };
        if (!exists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
        }

        // Call AI backend to generate embeddings and store vectors for this custom tag
        aiBackendService.generateAndStoreCustomTagVectors(contentType, contentId, customTag);

        // Update tags array in DB - merge existing + new tag
        updateTagsArray(contentType, contentId, Collections.singletonList(customTag));

        return ResponseEntity.ok("Custom tag added successfully");
    }

    private void updateTagsArray(String contentType, String contentId, List<String> newTags) {
        switch (contentType.toLowerCase()) {
            case "note" -> {
                noteRepository.findById(contentId).ifPresent(note -> {
                    List<String> merged = mergeTags(note.getTags(), newTags);
                    note.setTags(merged);
                    noteRepository.save(note);
                });
            }
            case "file", "image", "document" -> {
                fileMetadataRepository.findById(contentId).ifPresent(file -> {
                    List<String> merged = mergeTags(file.getTags(), newTags);
                    file.setTags(merged);
                    fileMetadataRepository.save(file);
                });
            }
            case "link" -> {
                linkRepository.findById(contentId).ifPresent(link -> {
                    List<String> merged = mergeTags(link.getTags(), newTags);
                    link.setTags(merged);
                    linkRepository.save(link);
                });
            }
        }
    }

    private List<String> mergeTags(List<String> existingTags, List<String> newTags) {
        if (existingTags == null) existingTags = new ArrayList<>();
        Set<String> set = new HashSet<>(existingTags);
        set.addAll(newTags);
        return new ArrayList<>(set);
    }
}

