package com.example.filebackend.controller;

import com.example.filebackend.repository.FileMetadataRepository;
import com.example.filebackend.repository.LinkRepository;
import com.example.filebackend.repository.NoteRepository;
import com.example.filebackend.service.AiBackendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class CustomTagController {

    private final NoteRepository noteRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final LinkRepository linkRepository;
    private final AiBackendService aiBackendService;

    // ✅ Add custom tag
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

        boolean exists = switch (contentType.toLowerCase()) {
            case "note" -> noteRepository.existsById(contentId);
            case "file", "image", "document" -> fileMetadataRepository.existsById(contentId);
            case "link" -> linkRepository.existsById(contentId);
            default -> false;
        };

        if (!exists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
        }

        aiBackendService.generateAndStoreCustomTagVectors(contentType, contentId, customTag);
        updateTagsArray(contentType, contentId, Collections.singletonList(customTag));

        return ResponseEntity.ok("Custom tag added successfully");
    }

    // ✅ Delete custom tag
    @DeleteMapping("/{contentType}/{contentId}/custom-tags/{tagName}")
    public ResponseEntity<?> deleteCustomTag(
            @PathVariable String contentType,
            @PathVariable String contentId,
            @PathVariable String tagName
    ) {
        boolean exists = switch (contentType.toLowerCase()) {
            case "note" -> noteRepository.existsById(contentId);
            case "file", "image", "document" -> fileMetadataRepository.existsById(contentId);
            case "link" -> linkRepository.existsById(contentId);
            default -> false;
        };

        if (!exists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Content not found");
        }

        // Remove tag from your DB (not shown here, keep your implementation)
        removeTagFromDatabase(contentType, contentId, tagName);

        // Call service to delete vector
        boolean aiDeleted = aiBackendService.deleteTagVector(contentType, contentId, tagName);

        if (!aiDeleted) {
            return ResponseEntity.ok("Tag deleted locally, but failed to delete vector in AI backend");
        }

        return ResponseEntity.ok("Custom tag deleted successfully");
    }


    // ✅ Update tag list in content
    private void updateTagsArray(String contentType, String contentId, List<String> newTags) {
        switch (contentType.toLowerCase()) {
            case "note" -> noteRepository.findById(contentId).ifPresent(note -> {
                List<String> merged = mergeTags(note.getTags(), newTags);
                note.setTags(merged);
                noteRepository.save(note);
            });
            case "file", "image", "document" -> fileMetadataRepository.findById(contentId).ifPresent(file -> {
                List<String> merged = mergeTags(file.getTags(), newTags);
                file.setTags(merged);
                fileMetadataRepository.save(file);
            });
            case "link" -> linkRepository.findById(contentId).ifPresent(link -> {
                List<String> merged = mergeTags(link.getTags(), newTags);
                link.setTags(merged);
                linkRepository.save(link);
            });
        }
    }

    // ✅ Remove a tag from content
    private void removeTagFromDatabase(String contentType, String contentId, String tagToRemove) {
        switch (contentType.toLowerCase()) {
            case "note" -> noteRepository.findById(contentId).ifPresent(note -> {
                List<String> updated = filterOutTag(note.getTags(), tagToRemove);
                note.setTags(updated);
                noteRepository.save(note);
            });
            case "file", "image", "document" -> fileMetadataRepository.findById(contentId).ifPresent(file -> {
                List<String> updated = filterOutTag(file.getTags(), tagToRemove);
                file.setTags(updated);
                fileMetadataRepository.save(file);
            });
            case "link" -> linkRepository.findById(contentId).ifPresent(link -> {
                List<String> updated = filterOutTag(link.getTags(), tagToRemove);
                link.setTags(updated);
                linkRepository.save(link);
            });
        }
    }

    private List<String> mergeTags(List<String> existingTags, List<String> newTags) {
        if (existingTags == null) existingTags = new ArrayList<>();
        Set<String> set = new HashSet<>(existingTags);
        set.addAll(newTags);
        return new ArrayList<>(set);
    }

    private List<String> filterOutTag(List<String> tags, String tagToRemove) {
        if (tags == null) return new ArrayList<>();
        return tags.stream()
                .filter(tag -> !tag.equalsIgnoreCase(tagToRemove))
                .toList();
    }
}
