package com.berksozcu.xml.entites.materials;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class MaterialXml {

    @XmlElement(name = "CODE")
    private String CODE;

    @XmlElement(name = "NAME")
    private String NAME;

    @XmlElement(name = "UNITSET_CODE")
    private String UNITSET_CODE;

    @XmlElement(name = "PURCHASE_PRICE")
    private String PURCHASE_PRICE;

    @XmlElement(name = "SALES_PRICE")
    private String SALES_PRICE;
}
