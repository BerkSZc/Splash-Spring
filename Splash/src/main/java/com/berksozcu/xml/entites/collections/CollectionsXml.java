package com.berksozcu.xml.entites.collections;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

import java.util.List;

@Data
//Xml nin kök ismini yazmamız gerekir böyle o kök içindeki bilgileri çekebilelim
@XmlRootElement(name = "SD_TRANSACTIONS")
//Bu anotasyon, JAXB’ye sınıfın hangi üyeleriyle XML eşleştirmesi yapacağını söyler.
@XmlAccessorType(XmlAccessType.FIELD)
public class CollectionsXml {

    //Kökün içindeki listenin ismini veririz
    @XmlElement(name = "SD_TRANSACTION")
    private List<CollectionXml> collections;
}
