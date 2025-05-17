package com.example.filebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "file_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {
    @Id
    private String id;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String fileUrl;
    private String userId;
    private Date uploadDate;
    private List<String> tags;
}