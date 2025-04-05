package com.example.filebackend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequest {
    private String title;
    private String content;
}