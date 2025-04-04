package com.example.filebackend.repository;

import com.example.filebackend.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FileMetadataRepository extends MongoRepository<FileMetadata, String> {
    List<FileMetadata> findByUserId(String userId);
    Optional<FileMetadata> findByIdAndUserId(String id, String userId);
}