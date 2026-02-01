package com.berksozcu.xml.entites.sales;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@XmlRootElement(name = "SALES_INVOICES")
@XmlAccessorType(XmlAccessType.FIELD)
public class SalesInvoicesXml {
    @XmlElement(name = "INVOICE")
    private List<SalesInvoiceXml> salesInvoices;
}
