package com.berksozcu.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "Malzeme Fiyat Geçmişi")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaterialPriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Enumerated(EnumType.STRING)
    @Column(name = "fatura_tipi")
    private InvoiceType invoiceType;

    @Column(name = "fiyat")
    private BigDecimal price;

    @Column(name = "tarih")
    private LocalDate date;

    @Column(name = "customer_name")
    private String customerName;

}
