package com.example.filebackend.service;

import com.example.filebackend.dto.NoteRequest;
import com.example.filebackend.dto.NoteResponse;
import com.example.filebackend.model.Note;
import com.example.filebackend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteResponse createNote(NoteRequest request, String userId) {
        Note note = Note.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .userId(userId)
                .createdDate(new Date())
                .lastModifiedDate(new Date())
                .build();

        Note savedNote = noteRepository.save(note);
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