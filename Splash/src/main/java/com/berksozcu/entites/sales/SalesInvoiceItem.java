package com.berksozcu.entites.sales;

import com.berksozcu.entites.material.Material;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "sales_invoice_item")
@AllArgsConstructor
@NoArgsConstructor
public class SalesInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sales_invoice_id")
    // Bu anotasyon ilişkinin çocuk tarafını belirtir.
    @JsonBackReference
    private SalesInvoice salesInvoice;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "unit_price", precision = 18, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "quantity", precision = 18, scale = 2)
    private BigDecimal quantity; //

    //Kdv Oranı bkz %20
    @Column(precision = 18, scale = 2)
    private BigDecimal kdv;

    // Malzemenin bulunduğu satırın kdv tutarı
    @Column(name = "kdv_tutar", precision = 18, scale = 2)
    private BigDecimal kdvTutar;

    //Malzemenin bulunduğu satırın Kdv siz fiyatı
    @Column(name = "line_total", precision = 18, scale = 2)
    private BigDecimal lineTotal; // unitPrice * quantity
}
