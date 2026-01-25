package com.berksozcu.xml.entites.purchase;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

import java.util.List;

@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class TransactionsXml {

    @XmlElement(name = "TRANSACTION")
    private List<TransactionXml> list;
}
