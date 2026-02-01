package com.berksozcu.xml.entites.payrolls;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class PayrollRollXml {
    @XmlElement(name = "TYPE")
    private Integer type; // Bordro Tipi
    @XmlElement(name = "NUMBER")
    private String number;
    @XmlElement(name = "MASTER_CODE")
    private String masterCode; // Müşteri Kodu
    @XmlElement(name = "DATE")
    private String date;
    @XmlElement(name = "TRANSACTIONS")
    private PayrollTransactionsXml transactions;
}
