package com.berksozcu.xml.entites.materials;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class PriceRecordXml {
    @XmlElement(name = "OWNER_CODE")
    private String code;

    @XmlElement(name = "PRICE")
    private String price;
}
