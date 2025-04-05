package com.example.filebackend.repository;

import com.example.filebackend.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByUserId(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
