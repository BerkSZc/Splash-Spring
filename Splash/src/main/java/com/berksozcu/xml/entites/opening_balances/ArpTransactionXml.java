package com.berksozcu.xml.entites.opening_balances;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class ArpTransactionXml {
    @XmlElement(name = "ARP_CODE")
    private String ARP_CODE;

    @XmlElement(name = "TRANNO")
    private String TRANNO;

    @XmlElement(name = "DESCRIPTION")
    private String DESCRIPTION;

    @XmlElement(name = "DEBIT")
    private String DEBIT;

    @XmlElement(name = "CREDIT")
    private String CREDIT;
}