package com.berksozcu.entites.company;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "company", schema = "logo")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Şirket İsmi
    private String name;

    @Column(name = "schema_name")
    //Şirket Kodu
    private String schemaName;

    private String description;
}
