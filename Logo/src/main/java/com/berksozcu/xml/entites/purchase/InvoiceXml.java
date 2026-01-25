package com.berksozcu.xml.entites.purchase;

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
    @XmlElement(name="DATE")
    private String DATE;

    @XmlElement(name="DOC_NUMBER")
    private String DOC_NUMBER;

    @XmlElement(name="ARP_CODE")
    private String ARP_CODE;

    @XmlElement(name="TOTAL_VAT")
    private BigDecimal TOTAL_VAT;

    @XmlElement(name="TOTAL_NET")
    private BigDecimal TOTAL_NET;

    @XmlElement(name="TRANSACTIONS")
    private TransactionsXml TRANSACTIONS;
}
