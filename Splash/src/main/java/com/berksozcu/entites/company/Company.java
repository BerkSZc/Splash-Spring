package com.berksozcu.entites.company;

import com.berksozcu.entites.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "company", schema = "splash")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Şirket Kodu
    @Column(name = "schema_name")
    private String schemaName;

    //Şirket İsmi
    private String name;

    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "vd_no")
    private String vdNo;

    @Column(name = "invoice_description")
    private String invoiceDescription;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Year> years = new ArrayList<>();
}
