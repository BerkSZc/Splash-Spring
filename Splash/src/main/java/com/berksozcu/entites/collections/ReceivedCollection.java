package com.berksozcu.entites.collections;

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
@Table(name = "received_collection")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReceivedCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    //Tarih
    private LocalDate date;

    //Açıklama
    private String comment;

    //tutar
    @Column(precision = 18, scale = 2)
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    //Müşteri ismi
    @Column(name = "customer_name")
    private String customerName;

    //İşlem numarası
    @Column(name = "file_no", unique = true)
    private String fileNo;
}
