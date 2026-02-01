package com.berksozcu.xml.entites.materials;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

import java.util.List;

@XmlRootElement(name = "ITEMS")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class ItemsXml {
    @XmlElement(name = "ITEM")
    private List<MaterialXml> items;

}
