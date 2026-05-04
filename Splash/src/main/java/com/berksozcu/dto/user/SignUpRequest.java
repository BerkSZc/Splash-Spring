package com.berksozcu.dto.user;

import lombok.Data;

@Data
public class SignUpRequest {
    private String username;
    private String password;
    private String companyName;
    private String description;
}