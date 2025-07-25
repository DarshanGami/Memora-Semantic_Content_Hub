package com.example.filebackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "links")
public class Link {
    @Id
    private String id;
    private String url;
    private String title;
    private String description;
    private String userId;
    private Date savedDate;
    private List<String> tags = new ArrayList<>();

}