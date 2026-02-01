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
public class TransactionXml {
    @XmlElement(name = "TYPE")
    private Integer TYPE;

    @XmlElement(name = "MASTER_CODE")
    private String MASTER_CODE;

    @XmlElement(name = "QUANTITY")
    private BigDecimal QUANTITY;

    @XmlElement(name = "PRICE")
    private BigDecimal PRICE;

    @XmlElement(name = "TOTAL")
    private BigDecimal TOTAL;

    @XmlElement(name = "TOTAL_NET")
    private BigDecimal TOTAL_NET;

    @XmlElement(name = "VAT_RATE")
    private BigDecimal VAT_RATE;

    @XmlElement(name = "VAT_AMOUNT")
    private BigDecimal VAT_AMOUNT;
}