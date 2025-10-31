package com.berksozcu.entites;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "Malzeme Satış Kalemleri")
@AllArgsConstructor
@NoArgsConstructor
public class SalesInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "satıs_faturası_id")
    // Bu anotasyon ilişkinin çocuk tarafını belirtir.
    @JsonBackReference
    private SalesInvoice salesInvoice;

    @ManyToOne
    @JoinColumn(name = "malzeme_id")
    private Material material;

    @Column(name = "Birim Fiyat", precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "Miktar", precision = 18, scale = 2)
    private BigDecimal quantity; //

    @Column(name = "Kdv Oranı")
    private BigDecimal kdv;

    @Column(name = "Kdv Tutarı")
    private BigDecimal kdvTutar;

    @Column(name = "Fatura Toplamı", precision = 18, scale = 2)
    private BigDecimal lineTotal; // unitPrice * quantity
}
