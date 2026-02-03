package com.berksozcu.xml.service;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.repository.*;
import com.berksozcu.xml.entites.collections.AttachmentArp;
import com.berksozcu.xml.entites.collections.CollectionXml;
import com.berksozcu.xml.entites.collections.CollectionsXml;
import com.berksozcu.xml.entites.collections.TransactionField;
import com.berksozcu.xml.entites.customer.CustomerXml;
import com.berksozcu.xml.entites.customer.CustomersXml;
import com.berksozcu.xml.entites.materials.ItemsXml;
import com.berksozcu.xml.entites.materials.MaterialXml;
import com.berksozcu.xml.entites.opening_balances.ArpTransactionXml;
import com.berksozcu.xml.entites.opening_balances.ArpTransactionsXml;
import com.berksozcu.xml.entites.opening_balances.ArpVoucherXml;
import com.berksozcu.xml.entites.opening_balances.ArpVouchersXml;
import com.berksozcu.xml.entites.payrolls.PayrollRollXml;
import com.berksozcu.xml.entites.payrolls.PayrollTransactionsXml;
import com.berksozcu.xml.entites.payrolls.PayrollTxXml;
import com.berksozcu.xml.entites.payrolls.PayrollsXml;
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
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class XmlExportService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Transactional
    public byte[] exportPurchaseInvoices(int year) throws Exception {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<PurchaseInvoice> purchaseInvoices = purchaseInvoiceRepository.findAllByDateBetween(start, end);

        PurchaseInvoicesXml rootXml = new PurchaseInvoicesXml();
        List<InvoiceXml> invoiceXmlList = new ArrayList<>();

        for (PurchaseInvoice inv : purchaseInvoices) {
            InvoiceXml invXml = new InvoiceXml();
            invXml.setCOMPANY_ID(inv.getCompany().getId());
            invXml.setDATE(inv.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setDOC_NUMBER(inv.getFileNo());
            invXml.setARP_CODE(inv.getCustomer().getCode());
            invXml.setTOTAL_VAT(inv.getKdvToplam());
            invXml.setTOTAL_NET(inv.getTotalPrice());
            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for (PurchaseInvoiceItem item : inv.getItems()) {
                TransactionXml tx = new TransactionXml();
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

        for (SalesInvoice inv : salesInvoiceList) {
            SalesInvoiceXml invXml = new SalesInvoiceXml();

            invXml.setTYPE(8);
            invXml.setCOMPANY_ID(inv.getCompany().getId());
            invXml.setDATE(inv.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setTOTAL_NET(inv.getTotalPrice().setScale(2, RoundingMode.HALF_UP));
            invXml.setTOTAL_VAT(inv.getKdvToplam().setScale(2, RoundingMode.HALF_UP));
            invXml.setNUMBER(inv.getFileNo());
            invXml.setARP_CODE(inv.getCustomer().getCode());

            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for (SalesInvoiceItem item : inv.getItems()) {
                TransactionXml tx = new TransactionXml();
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

    @Transactional
    public byte[] exportMaterials() throws Exception {

        List<Material> materials = materialRepository.findAll();

        ItemsXml rootXml = new ItemsXml();
        List<MaterialXml> materialXmlList = new ArrayList<>();

        for (Material m : materials) {
            MaterialXml mXml = new MaterialXml();

            mXml.setCODE(m.getCode());
            mXml.setNAME(m.getComment());
            mXml.setUNITSET_CODE("ADET");
            mXml.setPURCHASE_PRICE(m.getPurchasePrice().setScale(2, RoundingMode.HALF_UP).toString());
            mXml.setSALES_PRICE(m.getSalesPrice().setScale(2, RoundingMode.HALF_UP).toString());

            materialXmlList.add(mXml);
        }
        rootXml.setItems(materialXmlList);
        JAXBContext context = JAXBContext.newInstance(ItemsXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);

        return baos.toByteArray();
    }

    @Transactional
    public byte[] exportCustomers() throws Exception {
        List<Customer> customers = customerRepository.findAll();

        CustomersXml rootXml = new CustomersXml();
        List<CustomerXml> customerXmlList = new ArrayList<>();

        for (Customer c : customers) {
            CustomerXml cXml = new CustomerXml();

            cXml.setCODE(c.getCode());
            cXml.setCITY(c.getLocal());
            cXml.setDISTRICT(c.getDistrict());
            cXml.setTITLE(c.getName());
            cXml.setTAX_ID(c.getVdNo());
            cXml.setADDRESS1(c.getAddress());
            cXml.setRECORD_STATUS(c.isArchived() ? 1 : 0);

            customerXmlList.add(cXml);
        }
        rootXml.setCustomers(customerXmlList);

        JAXBContext context = JAXBContext.newInstance(CustomersXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);
        return baos.toByteArray();
    }

    @Transactional
    public byte[] exportCollections(int year) throws Exception {
        LocalDate start =  LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        List<PaymentCompany> paymentCompanyList = paymentCompanyRepository.findAllByDateBetween(start, end);
        List<ReceivedCollection> receivedCollectionList = receivedCollectionRepository.findAllByDateBetween(start, end);

        CollectionsXml rootXml = new CollectionsXml();
        List<CollectionXml> collectionXmlList = new ArrayList<>();

        for(ReceivedCollection rc : receivedCollectionList) {
            CollectionXml cXml = new CollectionXml();
            cXml.setTYPE(11);
            cXml.setCOMPANY_ID(rc.getCompany().getId());
            cXml.setDATE(rc.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            cXml.setAMOUNT(rc.getPrice().setScale(2, RoundingMode.HALF_UP).toString());
            cXml.setDESCRIPTION(rc.getComment());
            cXml.setSIGN(1);
            cXml.setNUMBER(rc.getFileNo());
            cXml.setSD_CODE("1");


            AttachmentArp attachmentArp = new AttachmentArp();
            TransactionField tf = new TransactionField();
            tf.setArpCode(rc.getCustomer().getCode());
            attachmentArp.setTransaction(tf);
            cXml.setAttachmentArp(attachmentArp);
            collectionXmlList.add(cXml);
        }
        for(PaymentCompany py : paymentCompanyList) {
            CollectionXml cXml = new CollectionXml();
            cXml.setTYPE(12);
            cXml.setSD_CODE("2");
            cXml.setCOMPANY_ID(py.getCompany().getId());
            cXml.setDATE(py.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            cXml.setAMOUNT(py.getPrice().setScale(2, RoundingMode.HALF_UP).toString());
            cXml.setDESCRIPTION(py.getComment());
            cXml.setNUMBER(py.getFileNo());
            cXml.setSIGN(0);

            AttachmentArp attachmentArp = new AttachmentArp();
            TransactionField tf = new TransactionField();
            tf.setArpCode(py.getCustomer().getCode());
            attachmentArp.setTransaction(tf);
            cXml.setAttachmentArp(attachmentArp);

            collectionXmlList.add(cXml);
        }
        rootXml.setCollections(collectionXmlList);

        JAXBContext context = JAXBContext.newInstance(CollectionsXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);

        return baos.toByteArray();
    }

    @Transactional
    public byte[] exportPayrolls(int year) throws Exception {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<Payroll> payrollList = payrollRepository.findByTransactionDateBetween(start, end);

        PayrollsXml rootXml = new PayrollsXml();
        List<PayrollRollXml> payrollsXmlList = new ArrayList<>();

        Map<String, List<Payroll>> groupedByCustomer = payrollList.stream()
                .collect(Collectors.groupingBy(p -> p.getCustomer().getCode() + "-" + p.getPayrollModel()));

        for(List<Payroll> customerPayrolls : groupedByCustomer.values()) {
            Payroll first = customerPayrolls.getFirst();

            PayrollRollXml rollXml = new PayrollRollXml();

            rollXml.setType(first.getPayrollModel() == PayrollModel.INPUT ? 1 : 3);
            rollXml.setCOMPANY_ID(first.getCompany().getId());
            rollXml.setMasterCode(first.getCustomer().getCode());
            rollXml.setDate(first.getTransactionDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

            PayrollTransactionsXml transactionsXml = new PayrollTransactionsXml();
            List<PayrollTxXml> payrollTxXmls = new ArrayList<>();
            for(Payroll payroll : customerPayrolls) {
                PayrollTxXml ptxXml = new PayrollTxXml();
                ptxXml.setNumber(payroll.getFileNo());
                ptxXml.setDueDate(payroll.getExpiredDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
                ptxXml.setDate(payroll.getTransactionDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
                ptxXml.setAmount(payroll.getAmount().setScale(2, RoundingMode.HALF_UP).toString());
                payrollTxXmls.add(ptxXml);
            }
            transactionsXml.setList(payrollTxXmls);
            rollXml.setTransactions(transactionsXml);
            payrollsXmlList.add(rollXml);
        }
        rootXml.setRolls(payrollsXmlList);

        JAXBContext context =  JAXBContext.newInstance(PayrollsXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);
        return baos.toByteArray();
    }

    @Transactional
    public byte[] exportOpeningVouchers(int year) throws Exception {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<OpeningVoucher> voucherList = openingVoucherRepository.findAllByDateBetween(start, end);

        ArpVouchersXml rootXml = new ArpVouchersXml();
        List<ArpVoucherXml> voucherXmlList = new ArrayList<>();

        if(!voucherList.isEmpty()) {
            ArpVoucherXml vXml = new ArpVoucherXml();
            vXml.setNumber("DEVIR_" + year);
            vXml.setDate(start.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

            ArpTransactionsXml txsWrapper = new ArpTransactionsXml();
            List<ArpTransactionXml> txList = new ArrayList<>();

            for(OpeningVoucher op : voucherList) {
                ArpTransactionXml tx = new ArpTransactionXml();
                tx.setARP_CODE(op.getCustomer().getName());
                tx.setDESCRIPTION(op.getDescription());
                tx.setCREDIT(op.getCredit().setScale(2, RoundingMode.HALF_UP).toString());
                tx.setDEBIT(op.getDebit().setScale(2, RoundingMode.HALF_UP).toString());

                txList.add(tx);
            }
            txsWrapper.setList(txList);
            vXml.setTransactions(txsWrapper);
            voucherXmlList.add(vXml);
        }
            rootXml.setVouchers(voucherXmlList);

        JAXBContext context = JAXBContext.newInstance(ArpVouchersXml.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        marshaller.marshal(rootXml, baos);
        return baos.toByteArray();
    }
}
