package com.berksozcu.xml.entites.payrolls;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@XmlRootElement(name = "CQPN_ROLLS")
@XmlAccessorType(XmlAccessType.FIELD)
public class PayrollsXml {
    @XmlElement(name = "CHQPN_ROLL")
    private List<PayrollRollXml> rolls;
}