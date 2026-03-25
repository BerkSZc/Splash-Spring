package com.berksozcu.entites.customer;

import com.berksozcu.entites.company.Company;
import jakarta.persistence.*;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customer")
    public class Customer {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "customer_code", nullable = false, unique = true)
        private String code;

        //Müşteri Unvanı
        private String name;

        //Adres
        private String address;

        //Ülke
        private String country;

        //İl
        private String local;

        //İlçe
        private String district;

        //
        @Column(name= "vd_no")
        private String vdNo;

        @ManyToOne
        @JoinColumn(name = "company_id")
        private Company company;

        @Column(nullable = false)
        private boolean archived = false;

    }

