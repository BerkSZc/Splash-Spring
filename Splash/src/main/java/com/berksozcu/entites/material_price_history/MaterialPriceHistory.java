package com.berksozcu.entites.material_price_history;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.material.Material;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    //Fatura tipi
    @Column(name = "invoice_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private InvoiceType invoiceType;

    @Column(name = "invoice_id")
    private Long invoiceId;

    //fiyat
    @Column(precision = 18, scale = 2)
    private BigDecimal price;

    //tarih
    private LocalDate date;

    //Müşteri İsmi
    @Column(name = "customer_name")
    private String customerName;

    //Miktar
    @Column(precision = 18, scale = 2)
    private BigDecimal quantity;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

}
