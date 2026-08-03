package com.berksozcu.xml.entites.invoice;

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
@XmlRootElement(name = "SALES_INVOICES")
@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class SalesInvoicesXml {
    @XmlElement(name = "INVOICE")
    private List<InvoiceXml> invoices;
}