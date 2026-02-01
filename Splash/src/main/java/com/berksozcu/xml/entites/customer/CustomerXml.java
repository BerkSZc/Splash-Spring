package com.berksozcu.xml.entites.customer;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class CustomerXml {

    @XmlElement(name = "CODE")
    private String CODE;

    @XmlElement(name = "TITLE")
    private String TITLE;

    @XmlElement(name = "ACC_RISK_TOTAL")
    private String ACC_RISK_TOTAL;

    @XmlElement(name = "ADDRESS1")
    private String ADDRESS1;

    @XmlElement(name = "DISTRICT")
    private String DISTRICT;

    @XmlElement(name = "CITY")
    private String CITY;

    @XmlElement(name = "TOWN")
    private String TOWN;

    @XmlElement(name = "TAX_ID")
    private String TAX_ID;

    @XmlElement(name = "RECORD_STATUS")
    private Integer RECORD_STATUS;
}
