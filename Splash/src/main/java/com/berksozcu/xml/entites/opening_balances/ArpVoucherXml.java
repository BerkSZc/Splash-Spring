package com.berksozcu.xml.entites.opening_balances;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class ArpVoucherXml {
    @XmlElement(name = "NUMBER")
    private String number;

    @XmlElement(name = "COMPANY_ID")
    private Long company_id;

    @XmlElement(name = "DATE")
    private String date;

    @XmlElement(name = "TRANSACTIONS")
    private ArpTransactionsXml transactions;
}
