package com.example.filebackend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private String id;
    private String title;
    private String content;
    private Date createdDate;
    private Date lastModifiedDate;
    private List<String> tags = new ArrayList<>();
}