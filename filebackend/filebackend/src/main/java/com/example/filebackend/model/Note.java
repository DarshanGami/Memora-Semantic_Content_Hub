package com.example.filebackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
