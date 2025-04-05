package com.example.filebackend.controller;

import com.example.filebackend.dto.NoteRequest;
import com.example.filebackend.dto.NoteResponse;
import com.example.filebackend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @RequestBody NoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                noteService.createNote(request, userDetails.getUsername())
        );
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
}