package com.example.filebackend.controller;

import com.example.filebackend.dto.FileResponse;
import com.example.filebackend.service.FileService;
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
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(file, userDetails.getUsername()));
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
    ) throws IOException{
        fileService.deleteFile(fileId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}