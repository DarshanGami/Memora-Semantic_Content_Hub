package com.example.filebackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

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
}