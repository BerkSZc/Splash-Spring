package com.berksozcu.dto.payroll;

import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PayrollDto {

        private Long id;

        //Çekin alındığı tarih
        private LocalDate transactionDate;

        //Çekin Vadesi
        private LocalDate expiredDate;

        //Çek veya senetin giriş mi çıkış mı olduğunun göstergesi
        private PayrollModel payrollModel;

        //Çek mi Senet mi olduğunun göstergesi
        private PayrollType payrollType;

        private Long customerId;

        private String customerName;

        private BigDecimal finalBalance;

        private Long companyId;

        private String fileNo;

        private String bankName;

        private String bankBranch;

        private BigDecimal amount;
}
