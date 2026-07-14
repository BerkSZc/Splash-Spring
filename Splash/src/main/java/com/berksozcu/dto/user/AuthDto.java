package com.berksozcu.dto.user;

import lombok.Data;

@Data
public class AuthDto {
    private String username;
    private String password;
    private String companyName;
    private String description;
}