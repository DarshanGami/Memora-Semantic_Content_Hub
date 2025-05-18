package com.example.filebackend.service;

import com.example.filebackend.dto.NoteRequest;
import com.example.filebackend.dto.NoteResponse;
import com.example.filebackend.model.Note;
import com.example.filebackend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final AiBackendService aiBackendService;  // For calling AI backend to generate embeddings

    // Create a new note
    public NoteResponse createNote(NoteRequest request, String userId) {
        // Ensure tags are initialized (even if not provided)
        if (request.getTags() == null) {
            request.setTags(new ArrayList<>()); // Initialize tags as empty if not provided
        }

        // Build the Note object
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .userId(userId)
                .createdDate(new Date())
                .lastModifiedDate(new Date())
                .tags(request.getTags())  // Set tags (could be empty list)
                .build();

        // Save the note to the database
        Note savedNote = noteRepository.save(note);

        // Send tag request to AI backend to generate embeddings and store vectors
        for (String customTag : request.getTags()) {
            aiBackendService.generateAndStoreCustomTagVectors("note", savedNote.getId(), customTag);
        }

        // Return the response DTO
        return mapToNoteResponse(savedNote);
    }

    // Get all notes for a user
    public List<NoteResponse> getUserNotes(String userId) {
        // Fetch notes for the given user and map them to NoteResponse
        return noteRepository.findByUserId(userId).stream()
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    // Delete a note by ID
    @Transactional
    public void deleteNote(String noteId, String userId) {
        // Check if note exists and belongs to the user
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        noteRepository.delete(note); // Delete the note from DB
    }

    // Update an existing note
    @Transactional
    public NoteResponse updateNote(String noteId, NoteRequest request, String userId) {
        // Find the note by ID and user
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        // Update note fields
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setTags(request.getTags());
        note.setLastModifiedDate(new Date());

        // Save the updated note to DB
        noteRepository.save(note);

        // Return the updated note response
        return mapToNoteResponse(note);
    }

    // Search notes by keyword (for the given user)
    public List<NoteResponse> searchNotes(String userId, String keyword) {
        // Implement search logic (basic search for now)
        return noteRepository.findByUserId(userId).stream()
                .filter(note -> note.getContent().contains(keyword) || note.getTitle().contains(keyword))
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    // Map Note to NoteResponse (DTO)
    private NoteResponse mapToNoteResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .createdDate(note.getCreatedDate())
                .lastModifiedDate(note.getLastModifiedDate())
                .tags(note.getTags())  // Include tags in response
                .build();
    }
}
