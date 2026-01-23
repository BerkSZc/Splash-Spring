package com.berksozcu.entites.customer;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customer")
    public class Customer {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "customer_code")
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


        @Column(nullable = false)
        private boolean archived = false;

    }

