package com.example.filebackend.controller;

import com.example.filebackend.dto.LinkRequest;
import com.example.filebackend.dto.LinkResponse;
import com.example.filebackend.service.LinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/links")
@RequiredArgsConstructor
public class LinkController {
    private final LinkService linkService;

    @PostMapping
    public ResponseEntity<LinkResponse> saveLink(
            @RequestBody LinkRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                linkService.saveLink(request, userDetails.getUsername())
        );
    }

    @GetMapping
    public ResponseEntity<List<LinkResponse>> getUserLinks(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                linkService.getUserLinks(userDetails.getUsername())
        );
    }

    @DeleteMapping("/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable String linkId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        linkService.deleteLink(linkId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}