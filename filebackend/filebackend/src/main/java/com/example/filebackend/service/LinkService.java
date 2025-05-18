package com.example.filebackend.service;

import com.example.filebackend.dto.LinkRequest;
import com.example.filebackend.dto.LinkResponse;
import com.example.filebackend.model.Link;
import com.example.filebackend.repository.LinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LinkService {
    private final LinkRepository linkRepository;
    private final AiBackendService aiBackendService;  // For calling AI backend to generate embeddings

    // Save a new link
    public LinkResponse saveLink(LinkRequest request, String userId) {
        // Ensure tags are initialized (even if not provided)
        if (request.getTags() == null) {
            request.setTags(new ArrayList<>()); // Initialize tags as empty list if not provided
        }

        // Create the link (metadata)
        Link link = Link.builder()
                .url(request.getUrl())
                .title(request.getTitle())
                .description(request.getDescription())
                .userId(userId)
                .savedDate(new Date())
                .tags(request.getTags())  // Set tags (could be empty list)
                .build();

        // Save the link to the database
        Link savedLink = linkRepository.save(link);

        // Call AI backend to generate and store tag vectors for each custom tag
        for (String customTag : request.getTags()) {
            aiBackendService.generateAndStoreCustomTagVectors("link", savedLink.getId(), customTag);
        }

        // Return the response DTO
        return mapToResponse(savedLink);
    }

    // Get all links for a user
    public List<LinkResponse> getUserLinks(String userId) {
        return linkRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Delete a link by ID
    @Transactional
    public void deleteLink(String linkId, String userId) {
        // Check if the link exists and belongs to the user
        Link link = linkRepository.findByIdAndUserId(linkId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        linkRepository.delete(link);  // Delete the link from DB
    }

    // Map Link to LinkResponse (DTO)
    private LinkResponse mapToResponse(Link link) {
        return LinkResponse.builder()
                .id(link.getId())
                .url(link.getUrl())
                .title(link.getTitle())
                .description(link.getDescription())
                .savedDate(link.getSavedDate())
                .tags(link.getTags())  // Include tags in response
                .build();
    }
}
