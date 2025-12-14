package com.berksozcu.entites.material_price_history;

import com.berksozcu.entites.material.Material;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Table(name = "material_price_history")
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
    //Fatura tipi
    private InvoiceType invoiceType;

    //fiyat
    private BigDecimal price;

    //tarih
    private LocalDate date;

    //Müşteri İsmi
    private String customerName;

    //Miktar
    private BigDecimal quantity;

}
