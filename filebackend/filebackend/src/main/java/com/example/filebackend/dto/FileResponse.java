package com.example.filebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    private String id;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String fileUrl;
    private Date uploadDate;
}