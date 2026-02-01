package com.berksozcu.xml.entites.sales;

import com.berksozcu.xml.entites.purchase.TransactionsXml;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

import java.math.BigDecimal;

@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class SalesInvoiceXml {
    @XmlElement(name = "TYPE")
    private Integer TYPE;

    @XmlElement(name = "NUMBER")
    private String NUMBER;

    @XmlElement(name = "DATE")
    private String DATE;

    @XmlElement(name = "ARP_CODE")
    private String ARP_CODE;

    @XmlElement(name = "TOTAL_NET")
    private BigDecimal TOTAL_NET;

    @XmlElement(name = "TOTAL_VAT")
    private BigDecimal TOTAL_VAT;

    @XmlElement(name = "CANCELLED")
    private Integer CANCELLED;

    @XmlElement(name = "TRANSACTIONS")
    private TransactionsXml TRANSACTIONS;
}
