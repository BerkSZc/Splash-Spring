package com.berksozcu.entites.sales;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales_invoice")
public class SalesInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    //Tarih
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "file_no", unique = true)
    private String fileNo;

    //Tüm malzemelerden sonra hesaplanan toplam kdv
    @Column(name = "kdv_toplam", precision = 18, scale = 2)
    private BigDecimal kdvToplam;


    //Fatura Tipi
    private Integer type;

    //Kdv dahit net toplam tutar
    @Column(name = "total_price", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "eur_selling_rate", precision = 18, scale = 2)
    private BigDecimal eurSellingRate;

    @Column(name = "usd_selling_rate", precision = 18, scale = 2)
    private BigDecimal usdSellingRate;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToMany(mappedBy = "salesInvoice", cascade=CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SalesInvoiceItem> items = new ArrayList<>();
}
