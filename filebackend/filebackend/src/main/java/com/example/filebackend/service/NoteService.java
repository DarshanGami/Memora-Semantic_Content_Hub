package com.example.filebackend.service;

import com.example.filebackend.dto.NoteRequest;
import com.example.filebackend.dto.NoteResponse;
import com.example.filebackend.exception.NoteNotFoundException;
import com.example.filebackend.exception.UnauthorizedAccessException;
import com.example.filebackend.model.Note;
import com.example.filebackend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteResponse createNote(NoteRequest request, String userId) {
        // Ensure tags are initialized as an empty list if not provided
        if (request.getTags() == null) {
            request.setTags(new ArrayList<>());  // Initialize as an empty list if no tags are provided
        }

        // Create the note with the tags field included
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .userId(userId)
                .tags(request.getTags())  // Include the tags field (even if empty)
                .createdDate(new Date())
                .lastModifiedDate(new Date())
                .build();

        // Save the note to the database
        Note savedNote = noteRepository.save(note);

        // Return the response after saving
        return mapToResponse(savedNote);
    }


    public List<NoteResponse> getUserNotes(String userId) {
        return noteRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteNote(String noteId, String userId) {
        noteRepository.deleteByIdAndUserId(noteId, userId);
    }

    public NoteResponse updateNote(String noteId, NoteRequest request, String userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException("Note not found with ID: " + noteId));

        if (!note.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to edit this note.");
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setLastModifiedDate(new Date());

        Note updatedNote = noteRepository.save(note);
        return mapToResponse(updatedNote);
    }

    public List<NoteResponse> searchNotes(String userId, String keyword) {
        List<Note> notes = noteRepository.findByUserIdAndTextSearch(userId, keyword);
        return notes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .createdDate(note.getCreatedDate())
                .lastModifiedDate(note.getLastModifiedDate())
                .build();
    }
}