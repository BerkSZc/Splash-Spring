package com.berksozcu.xml.entites.payrolls;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
public class PayrollTransactionsXml {
    @XmlElement(name = "TRANSACTION")
    private List<PayrollTxXml> list;
}