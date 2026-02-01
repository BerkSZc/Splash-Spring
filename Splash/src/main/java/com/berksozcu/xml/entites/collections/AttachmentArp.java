package com.berksozcu.xml.entites.collections;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class AttachmentArp {

    @XmlElement(name = "TRANSACTION")
    private TransactionField transaction;
}
