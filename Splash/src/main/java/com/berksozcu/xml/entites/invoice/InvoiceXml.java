package com.berksozcu.xml.entites.invoice;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@XmlAccessorType(XmlAccessType.FIELD)
public class InvoiceXml {

    @XmlElement(name = "TYPE")
    private Integer TYPE;

    @XmlElement(name = "COMPANY_ID")
    private Long COMPANY_ID;

    @XmlElement(name="NUMBER")
    private String NUMBER;  // Satış Faturaları için

    @XmlElement(name="DOC_NUMBER")
    private String DOC_NUMBER; // Satın Alma Faturaları için

    @XmlElement(name="ARP_CODE")
    private String ARP_CODE;

    @XmlElement(name="DATE")
    private String DATE;

    @XmlElement(name="TOTAL_VAT")
    private BigDecimal TOTAL_VAT;

    @XmlElement(name="TOTAL_NET")
    private BigDecimal TOTAL_NET;

    @XmlElement(name = "EUR_SELLING_RATE")
    private BigDecimal EUR_SELLING_RATE;

    @XmlElement(name = "USD_SELLING_RATE")
    private BigDecimal USD_SELLING_RATE;

    @XmlElement(name="INVOICED")
    private Boolean INVOICED;

    @XmlElement(name = "CANCELLED")
    private Integer CANCELLED;

    @XmlElement(name="TRANSACTIONS")
    private TransactionsXml TRANSACTIONS;
}
