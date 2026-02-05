package com.berksozcu.xml.entites.payrolls;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class PayrollTxXml {
    @XmlElement(name = "NUMBER")
    private String number;
    @XmlElement(name = "AMOUNT")
    private String amount;
    @XmlElement(name = "DUE_DATE")
    private String dueDate; // Vade
     @XmlElement(name = "BANK_TITLE")
    private String bank_title; // Banka ismi
     @XmlElement(name = "CITY")
    private String branch; // Banka Şubesi
    @XmlElement(name = "DATE")
    private String date; // İşlem Tarihi
}