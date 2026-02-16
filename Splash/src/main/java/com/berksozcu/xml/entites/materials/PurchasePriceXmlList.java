package com.berksozcu.xml.entites.materials;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@XmlRootElement(name = "ITEM_PURCHASE_PRICE")
@XmlAccessorType(XmlAccessType.FIELD)
@Getter
@Setter
public class PurchasePriceXmlList {
    @XmlElement(name = "PRICE_RECORD")
    private List<PriceRecordXml> records;
}
