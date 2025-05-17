package com.example.filebackend.service;

import com.example.filebackend.dto.LinkRequest;
import com.example.filebackend.dto.LinkResponse;
import com.example.filebackend.model.Link;
import com.example.filebackend.repository.LinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LinkService {
    private final LinkRepository linkRepository;

    public LinkResponse saveLink(LinkRequest request, String userId) {
        Link link = Link.builder()
                .url(request.getUrl())
                .title(request.getTitle())
                .description(request.getDescription())
                .userId(userId)
                .savedDate(new Date())
                .build();

        Link savedLink = linkRepository.save(link);
        return mapToResponse(savedLink);
    }

    public List<LinkResponse> getUserLinks(String userId) {
        return linkRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteLink(String linkId, String userId) {
        linkRepository.deleteByIdAndUserId(linkId, userId);
    }

    private LinkResponse mapToResponse(Link link) {
        return LinkResponse.builder()
                .id(link.getId())
                .url(link.getUrl())
                .title(link.getTitle())
                .description(link.getDescription())
                .savedDate(link.getSavedDate())
                .tags(link.getTags())  // Include tags here
                .build();
    }
}