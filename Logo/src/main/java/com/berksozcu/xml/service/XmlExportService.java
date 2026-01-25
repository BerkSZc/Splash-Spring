package com.berksozcu.xml.service;

import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.repository.SalesInvoiceRepository;
import com.berksozcu.xml.entites.purchase.InvoiceXml;
import com.berksozcu.xml.entites.purchase.PurchaseInvoicesXml;
import com.berksozcu.xml.entites.purchase.TransactionXml;
import com.berksozcu.xml.entites.purchase.TransactionsXml;
import com.berksozcu.xml.entites.sales.SalesInvoiceXml;
import com.berksozcu.xml.entites.sales.SalesInvoicesXml;
import jakarta.transaction.Transactional;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Marshaller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class XmlExportService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Transactional
    public byte[] exportPurchaseInvoices(int year)  throws Exception {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<PurchaseInvoice> purchaseInvoices = purchaseInvoiceRepository.findAllByDateBetween(start, end);

        PurchaseInvoicesXml rootXml = new PurchaseInvoicesXml();
        List<InvoiceXml> invoiceXmlList = new ArrayList<>();

        for(PurchaseInvoice inv : purchaseInvoices) {
            InvoiceXml invXml = new InvoiceXml();
            invXml.setDATE(inv.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setDOC_NUMBER(inv.getFileNo());
            invXml.setARP_CODE(inv.getCustomer().getCode());
            invXml.setTOTAL_VAT(inv.getKdvToplam());
            invXml.setTOTAL_NET(inv.getTotalPrice());
            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for(PurchaseInvoiceItem item : inv.getItems()) {
                TransactionXml tx  = new TransactionXml();
                tx.setTYPE(0);
                tx.setMASTER_CODE(item.getMaterial().getCode());
                tx.setQUANTITY(item.getQuantity());
                tx.setPRICE(item.getUnitPrice());
                tx.setVAT_RATE(item.getKdv());
                tx.setVAT_AMOUNT(item.getKdvTutar());

                BigDecimal lineTotal = item.getUnitPrice().multiply(item.getQuantity());
                tx.setTOTAL_NET(lineTotal.setScale(2, RoundingMode.HALF_UP));
                tx.setTOTAL(lineTotal.add(item.getKdvTutar()).setScale(2, RoundingMode.HALF_UP));

                txList.add(tx);
            }
            txsXml.setList(txList);
            invXml.setTRANSACTIONS(txsXml);
            invoiceXmlList.add(invXml);
        }
        rootXml.setInvoices(invoiceXmlList);

        JAXBContext context = JAXBContext.newInstance(PurchaseInvoicesXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);
        return baos.toByteArray();
    }

    @Transactional
    public byte[] exportSalesInvoices(int year) throws Exception {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<SalesInvoice> salesInvoiceList = salesInvoiceRepository.findAllByDateBetween(start, end);

        SalesInvoicesXml rootXml = new SalesInvoicesXml();
        List<SalesInvoiceXml> salesInvoiceXmls = new ArrayList<>();

        for(SalesInvoice inv : salesInvoiceList) {
            SalesInvoiceXml invXml = new SalesInvoiceXml();

            invXml.setTYPE(8);
            invXml.setDATE(inv.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setTOTAL_NET(inv.getTotalPrice().setScale(2, RoundingMode.HALF_UP));
            invXml.setTOTAL_VAT(inv.getKdvToplam().setScale(2, RoundingMode.HALF_UP));
            invXml.setNUMBER(inv.getFileNo());
            invXml.setARP_CODE(inv.getCustomer().getCode());

            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for(SalesInvoiceItem item : inv.getItems()) {
                TransactionXml tx  = new TransactionXml();
                tx.setTYPE(0);
                tx.setMASTER_CODE(item.getMaterial().getCode());
                tx.setQUANTITY(item.getQuantity());
                tx.setPRICE(item.getUnitPrice());
                tx.setVAT_RATE(item.getKdv());
                tx.setVAT_AMOUNT(item.getKdvTutar());

                BigDecimal lineTotal = item.getUnitPrice().multiply(item.getQuantity());
                tx.setTOTAL_NET(lineTotal.setScale(2, RoundingMode.HALF_UP));
                tx.setTOTAL(lineTotal.add(item.getKdvTutar()).setScale(2, RoundingMode.HALF_UP));

                txList.add(tx);
            }
            txsXml.setList(txList);
            invXml.setTRANSACTIONS(txsXml);
            salesInvoiceXmls.add(invXml);
        }
        rootXml.setSalesInvoices(salesInvoiceXmls);

        JAXBContext context = JAXBContext.newInstance(SalesInvoicesXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);
        return baos.toByteArray();
    }
}
