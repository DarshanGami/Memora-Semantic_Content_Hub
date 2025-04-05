package com.example.filebackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notes")
public class Note {
    @Id
    private String id;

    @TextIndexed
    private String title;
    @TextIndexed
    private String content;
    private String userId;
    private Date createdDate;
    private Date lastModifiedDate;
}