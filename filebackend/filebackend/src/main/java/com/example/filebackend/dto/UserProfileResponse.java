package com.example.filebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String name;
    private String username;
    private String avatarUrl;
    private String memberSince;
}
