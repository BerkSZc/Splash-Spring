package com.berksozcu.xml.entites.customer;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

import java.util.List;

@Data
@XmlRootElement(name = "AR_APS")
@XmlAccessorType(XmlAccessType.FIELD)
public class CustomersXml {

    @XmlElement(name = "AR_AP")
    private List<CustomerXml> customers;
}
