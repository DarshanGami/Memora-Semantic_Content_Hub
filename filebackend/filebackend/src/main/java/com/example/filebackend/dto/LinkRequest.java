package com.example.filebackend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkRequest {
    private String url;
    private String title;
    private String description;
    private List<String> tags=new ArrayList<>();
}