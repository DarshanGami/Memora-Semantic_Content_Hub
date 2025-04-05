package com.example.filebackend.dto;

import lombok.*;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkResponse {
    private String id;
    private String url;
    private String title;
    private String description;
    private Date savedDate;
}