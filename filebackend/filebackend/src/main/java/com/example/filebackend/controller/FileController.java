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
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {

        FileResponse response = fileService.uploadFile(file, userDetails.getUsername());

        // ✅ Only send for images
        if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            String message = String.format(
                    "{ \"content_id\": \"%s\", \"content_type\": \"image\", \"text\": \"%s\" }",
                    response.getId(),
                    response.getFileUrl().replace("\"", "\\\"")
            );
            kafkaProducerService.sendTagRequest(message);
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