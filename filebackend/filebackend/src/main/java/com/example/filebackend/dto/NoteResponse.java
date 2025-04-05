package com.example.filebackend.dto;

import lombok.*;
import java.util.Date;

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
}