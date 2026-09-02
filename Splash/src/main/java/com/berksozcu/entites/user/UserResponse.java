package com.berksozcu.entites.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private String token;
    private String schemaName;

    private Long companyId;
    private Long yearId;
    private Integer yearValue;
}
