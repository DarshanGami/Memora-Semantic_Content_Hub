package com.example.filebackend.service;

import com.example.filebackend.dto.FileResponse;
import com.example.filebackend.model.FileMetadata;
import com.example.filebackend.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileMetadataRepository fileMetadataRepository;
    private final CloudinaryService cloudinaryService;

    public FileResponse uploadFile(MultipartFile file, String userId) throws IOException {
        // 1. Upload file to Cloudinary
        String fileUrl = cloudinaryService.uploadFile(file);

        // 2. Save metadata to MongoDB
        FileMetadata metadata = FileMetadata.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .userId(userId)
                .uploadDate(new Date())
                .build();

        FileMetadata savedMetadata = fileMetadataRepository.save(metadata);

        // 3. Return response DTO
        return mapToFileResponse(savedMetadata);
    }

    public List<FileResponse> getUserFiles(String userId) {
        return fileMetadataRepository.findByUserId(userId).stream()
                .map(this::mapToFileResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFile(String fileId, String userId) {
        // 1. Check existence and ownership
        FileMetadata metadata = fileMetadataRepository
                .findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "File not found or access denied"
                ));

        try {
            // 2. Delete from storage
            cloudinaryService.deleteFile(metadata.getFileName());

            // 3. Delete metadata
            fileMetadataRepository.delete(metadata);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "File storage deletion failed"
            );
        }
    }

    // Helper method to map FileMetadata to FileResponse
    private FileResponse mapToFileResponse(FileMetadata metadata) {
        return FileResponse.builder()
                .id(metadata.getId())
                .fileName(metadata.getFileName())
                .fileType(metadata.getFileType())
                .fileSize(metadata.getFileSize())
                .fileUrl(metadata.getFileUrl())
                .uploadDate(metadata.getUploadDate())
                .build();
    }

    // Extracts public ID from Cloudinary URL
    private String extractPublicIdFromUrl(String url) {
        // Example URL: https://res.cloudinary.com/demo/raw/upload/v123/document.pdf
        String[] parts = url.split("/upload/")[1].split("/");
        return parts[parts.length - 1].split("\\.")[0]; // Returns "v123/document"
    }
}