package com.berksozcu.dto.company;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CompanyDto {

    private Long id;

    private String name;

    private String schemaName;

    private String companyAddress;

    private String invoiceDescription;

    private String vdNo;

    private Long userId;

    private List<YearDto> years = new ArrayList<>();
}
