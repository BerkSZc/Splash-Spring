package com.berksozcu.dto.company;

import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.user.User;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CompanyDto {

    private Long id;

    private String name;

    private String schemaName;

    private String description;

    private Long userId;

    private List<YearDto> years = new ArrayList<>();
}
