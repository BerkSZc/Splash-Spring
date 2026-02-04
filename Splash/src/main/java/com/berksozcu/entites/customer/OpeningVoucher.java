package com.berksozcu.entites.customer;

import com.berksozcu.entites.company.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "opening_voucher")
@Getter
@Setter
public class OpeningVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "file_no")
    private String fileNo;

    private String description;

    private LocalDate date;

    @Column(precision = 18, scale = 2)
    private BigDecimal debit;

    @Column(precision = 18, scale = 2)
    private BigDecimal credit;

    //Devir öncesi yılın son bakiyesi
    @Column(name = "final_balance", precision = 18, scale = 2)
    private BigDecimal finalBalance;

    @Column(name = "yearly_debit", precision = 18, scale = 2
    )
    private BigDecimal yearlyDebit;

    @Column(name = "yearly_credit", precision = 18, scale = 2)
    private BigDecimal yearlyCredit;
}
