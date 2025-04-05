package com.example.filebackend.repository;

import com.example.filebackend.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByUserId(String userId);
    Optional<Note> findByIdAndUserId(String id, String userId);
    void deleteByIdAndUserId(String id, String userId);
    @Query("{ userId: ?0, $or:[ {title: { $regex: ?1, $options: 'i' }},{ content: { $regex: ?1, $options: 'i' } }  ]  }")
    List<Note> findByUserIdAndTextSearch(String userId, String keyword);
}
