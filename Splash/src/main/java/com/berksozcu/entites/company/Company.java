package com.berksozcu.entites.company;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Year> years = new ArrayList<>();
}
