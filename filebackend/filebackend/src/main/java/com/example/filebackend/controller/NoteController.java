package com.example.filebackend.controller;

import com.example.filebackend.dto.NoteRequest;
import com.example.filebackend.dto.NoteResponse;
import com.example.filebackend.service.KafkaProducerService;
import com.example.filebackend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    private final KafkaProducerService kafkaProducerService;

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @RequestBody NoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Ensure the tags field is initialized (even if not provided)
        if (request.getTags() == null) {
            request.setTags(new ArrayList<>()); // Initialize as empty list if no tags provided
        }

        // Create the note
        NoteResponse response = noteService.createNote(request, userDetails.getUsername());

        // Send tag request
        kafkaProducerService.sendTagRequest(response.getId(), "note", request.getContent(), request.getTags());

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public ResponseEntity<List<NoteResponse>> getUserNotes(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                noteService.getUserNotes(userDetails.getUsername())
        );
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable String noteId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        noteService.deleteNote(noteId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable String noteId,
            @RequestBody NoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                noteService.updateNote(noteId, request, userDetails.getUsername())
        );
    }

//    @GetMapping("/search")
//    public ResponseEntity<List<NoteResponse>> searchNotes(
//            @RequestParam String q,  // Query parameter (e.g., /search?q=spring)
//            @AuthenticationPrincipal UserDetails userDetails
//    ) {
//        return ResponseEntity.ok(
//                noteService.searchNotes(userDetails.getUsername(), q)
//        );
//    }
}