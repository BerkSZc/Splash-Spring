package com.berksozcu.entites;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Satış Faturası")
public class SalesInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
    @Column(name = "Tarih")
    private Date date;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "Belge No")
    private String fileNo;

    @Column(name = "Kdv Toplam")
    private BigDecimal kdvToplam;


    @Column(name = "Tutar")
    private BigDecimal totalPrice;

    @OneToMany(mappedBy = "salesInvoice", cascade=CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SalesInvoiceItem> items;
}
