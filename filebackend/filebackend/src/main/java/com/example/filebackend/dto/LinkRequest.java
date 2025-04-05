package com.example.filebackend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkRequest {
    private String url;
    private String title;
    private String description;
}