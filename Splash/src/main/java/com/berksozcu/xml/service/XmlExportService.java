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
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
            invXml.setDATE(Objects.requireNonNullElse(inv.getDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setDOC_NUMBER(Objects.requireNonNullElse(inv.getFileNo(), ""));
            invXml.setARP_CODE(inv.getCustomer().getCode().trim().toUpperCase());
            invXml.setTOTAL_VAT(safeGet(inv.getKdvToplam()));
            invXml.setTOTAL_NET(safeGet(inv.getTotalPrice()));
            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for (PurchaseInvoiceItem item : inv.getItems()) {
                TransactionXml tx = new TransactionXml();
                tx.setTYPE(0);
                tx.setMASTER_CODE(item.getMaterial().getCode().trim().toUpperCase());
                tx.setQUANTITY(safeGet(item.getQuantity()));
                tx.setPRICE(safeGet(item.getUnitPrice()));
                tx.setVAT_RATE(safeGet(item.getKdv()));
                tx.setVAT_AMOUNT(safeGet(item.getKdvTutar()));

                BigDecimal lineTotal = safeGet(item.getUnitPrice()).multiply(safeGet(item.getQuantity()));
                tx.setTOTAL_NET(lineTotal.setScale(2, RoundingMode.HALF_UP));
                tx.setTOTAL(lineTotal.add(safeGet(item.getKdvTutar())).setScale(2, RoundingMode.HALF_UP));

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
            invXml.setDATE(Objects.requireNonNullElse(inv.getDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invXml.setTOTAL_NET(safeGet(inv.getTotalPrice()).setScale(2, RoundingMode.HALF_UP));
            invXml.setTOTAL_VAT(safeGet(inv.getKdvToplam()).setScale(2, RoundingMode.HALF_UP));
            invXml.setNUMBER(Objects.requireNonNullElse(inv.getFileNo(), ""));
            invXml.setARP_CODE(inv.getCustomer().getCode().trim().toUpperCase());

            TransactionsXml txsXml = new TransactionsXml();
            List<TransactionXml> txList = new ArrayList<>();

            for (SalesInvoiceItem item : inv.getItems()) {
                TransactionXml tx = new TransactionXml();
                tx.setTYPE(0);
                tx.setMASTER_CODE(item.getMaterial().getCode().trim().toUpperCase());
                tx.setQUANTITY(safeGet(item.getQuantity()));
                tx.setPRICE(safeGet(item.getUnitPrice()));
                tx.setVAT_RATE(safeGet(item.getKdv()));
                tx.setVAT_AMOUNT(safeGet(item.getKdvTutar()));

                BigDecimal lineTotal = safeGet(item.getUnitPrice()).multiply(safeGet(item.getQuantity()));
                tx.setTOTAL_NET(lineTotal.setScale(2, RoundingMode.HALF_UP));
                tx.setTOTAL(lineTotal.add(safeGet(item.getKdvTutar())).setScale(2, RoundingMode.HALF_UP));

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

            mXml.setCODE(m.getCode().trim().toUpperCase());
            mXml.setNAME(Objects.requireNonNullElse(m.getComment(), ""));
            mXml.setUNITSET_CODE("ADET");
            mXml.setPURCHASE_PRICE(safeGet(m.getPurchasePrice()).setScale(2, RoundingMode.HALF_UP).toString());
            mXml.setSALES_PRICE(safeGet(m.getSalesPrice()).setScale(2, RoundingMode.HALF_UP).toString());

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

            cXml.setCODE(c.getCode().trim().toUpperCase());
            cXml.setCITY(Objects.requireNonNullElse(c.getLocal(), ""));
            cXml.setDISTRICT(Objects.requireNonNullElse(c.getDistrict(), ""));
            cXml.setTITLE(Objects.requireNonNullElse(c.getName(), ""));
            cXml.setTAX_ID(Objects.requireNonNullElse(c.getVdNo(), ""));
            cXml.setADDRESS1(Objects.requireNonNullElse(c.getAddress(), ""));
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
            cXml.setDATE(Objects.requireNonNullElse(rc.getDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            cXml.setAMOUNT(safeGet(rc.getPrice()).setScale(2, RoundingMode.HALF_UP).toString());
            cXml.setDESCRIPTION(Objects.requireNonNullElse(rc.getComment(), ""));
            cXml.setSIGN(1);
            cXml.setNUMBER(Objects.requireNonNullElse(rc.getFileNo(), ""));
            cXml.setSD_CODE("1");


            AttachmentArp attachmentArp = new AttachmentArp();
            TransactionField tf = new TransactionField();
            tf.setArpCode(rc.getCustomer().getCode().trim().toUpperCase());
            attachmentArp.setTransaction(tf);
            cXml.setAttachmentArp(attachmentArp);
            collectionXmlList.add(cXml);
        }
        for(PaymentCompany py : paymentCompanyList) {
            CollectionXml cXml = new CollectionXml();
            cXml.setTYPE(12);
            cXml.setSD_CODE("2");
            cXml.setCOMPANY_ID(py.getCompany().getId());
            cXml.setDATE(Objects.requireNonNullElse(py.getDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            cXml.setAMOUNT(safeGet(py.getPrice()).setScale(2, RoundingMode.HALF_UP).toString());
            cXml.setDESCRIPTION(Objects.requireNonNullElse(py.getComment(), ""));
            cXml.setNUMBER(Objects.requireNonNullElse(py.getFileNo(), ""));
            cXml.setSIGN(0);

            AttachmentArp attachmentArp = new AttachmentArp();
            TransactionField tf = new TransactionField();
            tf.setArpCode(py.getCustomer().getCode().trim().toUpperCase());
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
            rollXml.setMasterCode(first.getCustomer().getCode().trim().toUpperCase());
            rollXml.setDate(Objects.requireNonNullElse(first.getTransactionDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));

            PayrollTransactionsXml transactionsXml = new PayrollTransactionsXml();
            List<PayrollTxXml> payrollTxXmls = new ArrayList<>();
            for(Payroll payroll : customerPayrolls) {
                PayrollTxXml ptxXml = new PayrollTxXml();
                ptxXml.setNumber(Objects.requireNonNullElse(payroll.getFileNo(), ""));
                ptxXml.setDueDate(Objects.requireNonNullElse(payroll.getExpiredDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
                ptxXml.setDate(Objects.requireNonNullElse(payroll.getTransactionDate(), LocalDate.now()).format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
                ptxXml.setAmount(safeGet(payroll.getAmount()).setScale(2, RoundingMode.HALF_UP).toString());
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
                tx.setARP_CODE(op.getCustomer().getCode().trim().toUpperCase());
                tx.setCUSTOMER_NAME(Objects.requireNonNullElse(op.getCustomerName(), ""));
                tx.setDESCRIPTION("Veri Dışarı Aktarımı");
                tx.setCREDIT(safeGet(op.getYearlyCredit()).setScale(2, RoundingMode.HALF_UP).toString());
                tx.setDEBIT(safeGet(op.getYearlyDebit()).setScale(2, RoundingMode.HALF_UP).toString());
                vXml.setCompany_id(op.getCompany().getId());

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

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value :  BigDecimal.ZERO;
    }
}
