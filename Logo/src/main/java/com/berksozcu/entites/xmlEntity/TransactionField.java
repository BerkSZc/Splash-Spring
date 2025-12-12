package com.berksozcu.entites.xmlEntity;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class TransactionField {

    @XmlElement(name = "ARP_CODE")
    private String arpCode;

    @XmlElement(name = "TRANNO")
    private String tranNo;

    @XmlElement(name = "DOC_NUMBER")
    private String docNumber;

    @XmlElement(name = "CREDIT")
    private String credit;

    @XmlElement(name = "DEBIT")
    private String debit;

    @XmlElement(name = "TC_AMOUNT")
    private String tcAmount;

    @XmlElement(name = "RC_AMOUNT")
    private String rcAmount;
}
