package com.berksozcu.entites.collections;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "payment_company")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentCompany {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    //Tarih
    private LocalDate date;

    //Açıklama
    private String comment;

    //Tutar
    @Column(precision = 18, scale = 2)
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    //Müşteri İsmi
    @Column(name = "customer_name")
    private String customerName;

    //İşlem no
    @Column(name = "file_no", unique = true)
    private String fileNo;
}
