package com.berksozcu.entites.payroll;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll", indexes = {
        @Index(name = "idx_payroll_date_file_no", columnList = "transaction_date, file_no")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Çekin alındığı tarih
    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    //Çekin Vadesi
    @Column(name = "expired_date")
    private LocalDate expiredDate;

    //Çek veya senetin giriş mi çıkış mı olduğunun göstergesi
    @Enumerated(EnumType.STRING)
    @Column(name = "payroll_model")
    private PayrollModel payrollModel;

    //Çek mi Senet mi olduğunun göstergesi
    @Enumerated(EnumType.STRING)
    @Column(name = "payroll_type")
    private PayrollType payrollType;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "file_no", unique = true)
    private String fileNo;

    @Column(name = "bank_name")
    private String bankName;

    //Banka şubesi
    @Column(name = "bank_branch")
    private String bankBranch;

    @Column(precision = 18, scale = 2)
    private BigDecimal amount;
}
