package com.example.filebackend.controller;

import com.example.filebackend.dto.FileResponse;
import com.example.filebackend.service.FileService;
import com.example.filebackend.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    private final KafkaProducerService kafkaProducerService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        // 1. Upload file & save metadata
        FileResponse response = fileService.uploadFile(file, userDetails.getUsername());
        String cloudinaryUrl = response.getFileUrl();

        // 2. Determine content type for tag request
        // Assuming images have fileType starting with "image/"
        String contentType = response.getFileType() != null && response.getFileType().startsWith("image/")
                ? "image" : "document";

        // 3. For images, send tag request to AI backend for tag generation
        if ("image".equalsIgnoreCase(contentType)) {
            // We might not have textual description, so send empty or fileName as text
            String textForTagging = response.getFileName() != null ? response.getFileName() : "";

            kafkaProducerService.sendTagRequest(
                    response.getId(),
                    "image",
                    cloudinaryUrl,
                    null  // custom tags if any, else null
            );
        } else {
            System.out.println("Skipping AI tag request for document: " + response.getId());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getUserFiles(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(fileService.getUserFiles(userDetails.getUsername()));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String fileId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        fileService.deleteFile(fileId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}