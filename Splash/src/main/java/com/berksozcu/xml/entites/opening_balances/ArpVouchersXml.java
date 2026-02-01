package com.berksozcu.xml.entites.opening_balances;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.Data;

import java.util.List;

@XmlRootElement(name = "ARP_VOUCHERS")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class ArpVouchersXml {
    @XmlElement(name = "ARP_VOUCHER")
    private List<ArpVoucherXml> vouchers;
}
