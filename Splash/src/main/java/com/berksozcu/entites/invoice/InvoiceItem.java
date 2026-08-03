package com.berksozcu.entites.invoice;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material.MaterialUnit;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "invoice_item")
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "unit_price", precision = 18, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "unit")
    @Enumerated(EnumType.STRING)
    private MaterialUnit unit;

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
