package com.berksozcu.xml.entites.collections;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class CollectionXml {

    @XmlElement(name = "TYPE")
    private Integer TYPE;

    @XmlElement(name = "SD_CODE")
    private String SD_CODE;

    @XmlElement(name = "DATE")
    private String DATE;

    @XmlElement(name = "NUMBER")
    private String NUMBER;

    @XmlElement(name = "AMOUNT")
    private String AMOUNT;

    @XmlElement(name = "DESCRIPTION")
    private String DESCRIPTION;

    @XmlElement(name = "SIGN")
    private Integer SIGN;

    @XmlElement(name = "ATTACHMENT_ARP")
    private AttachmentArp attachmentArp;
}
