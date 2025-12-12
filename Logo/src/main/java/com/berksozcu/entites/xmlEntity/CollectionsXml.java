package com.berksozcu.entites.xmlEntity;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

import java.util.List;

@Data
@XmlRootElement(name = "SD_TRANSACTIONS")
@XmlAccessorType(XmlAccessType.FIELD)
public class CollectionsXml {

    @XmlElement(name = "SD_TRANSACTION")
    private List<CollectionXml> collections;
}
