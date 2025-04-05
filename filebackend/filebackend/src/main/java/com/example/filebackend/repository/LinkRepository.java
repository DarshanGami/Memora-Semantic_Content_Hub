package com.example.filebackend.repository;

import com.example.filebackend.model.Link;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LinkRepository extends MongoRepository<Link, String> {
    List<Link> findByUserId(String userId);
    void deleteByIdAndUserId(String id, String userId);
}