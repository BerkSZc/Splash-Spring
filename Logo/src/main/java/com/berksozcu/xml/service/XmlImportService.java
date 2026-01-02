package com.berksozcu.xml.service;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material.MaterialUnit;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.payroll.Payroll;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.repository.*;
import com.berksozcu.xml.entites.collections.CollectionXml;
import com.berksozcu.xml.entites.collections.CollectionsXml;
import com.berksozcu.xml.entites.customer.CustomerXml;
import com.berksozcu.xml.entites.customer.CustomersXml;
import com.berksozcu.xml.entites.materials.ItemsXml;
import com.berksozcu.xml.entites.materials.MaterialXml;
import com.berksozcu.xml.entites.payrolls.PayrollRollXml;
import com.berksozcu.xml.entites.payrolls.PayrollTxXml;
import com.berksozcu.xml.entites.payrolls.PayrollsXml;
import com.berksozcu.xml.entites.purchase.InvoiceXml;
import com.berksozcu.xml.entites.purchase.PurchaseInvoicesXml;
import com.berksozcu.xml.entites.purchase.TransactionXml;
import com.berksozcu.xml.entites.sales.SalesInvoiceXml;
import com.berksozcu.xml.entites.sales.SalesInvoicesXml;
import jakarta.transaction.Transactional;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class XmlImportService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PurchaseInvoiceRepository invoiceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;

    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Transactional
    public void importPurchaseInvoices(MultipartFile file) throws Exception {

        JAXBContext context = JAXBContext.newInstance(PurchaseInvoicesXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        PurchaseInvoicesXml invoicesXml = (PurchaseInvoicesXml) unmarshaller.unmarshal(file.getInputStream());

        Map<String, Material> materialMap =
                materialRepository.findAll()
                        .stream()
                        .collect(Collectors.toMap(
                                m -> m.getCode().trim().toUpperCase(),
                                m -> m
                        ));

        for (InvoiceXml xmlInv : invoicesXml.getInvoices()) {

            PurchaseInvoice invoice = new PurchaseInvoice();

            // Tarih Logo formatı: 01.01.2025
            invoice.setDate(LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy")));

            invoice.setFileNo(xmlInv.getDOC_NUMBER());
            invoice.setKdvToplam(xmlInv.getTOTAL_VAT());
            invoice.setTotalPrice(xmlInv.getTOTAL_NET());
            // Customer eşleştirme
            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE()).orElse(null);

            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + xmlInv.getARP_CODE() + " → Fatura atlandı");
                continue; // müşteri yoksa faturayı atla
            }

            invoice.setCustomer(customer);

            List<PurchaseInvoiceItem> itemList = new ArrayList<>();

            // Fatura satırları
            for (TransactionXml tx : xmlInv.getTRANSACTIONS().getList()) {

                if (tx.getMASTER_CODE() == null || tx.getMASTER_CODE().isBlank()) {
                    System.err.println("HATA: MASTER_CODE boş! Satır numarası: " + tx);
                    continue;
                }
                // Malzeme eşleştirme
                String masterCode = tx.getMASTER_CODE().trim().toUpperCase();
                Material material = materialMap.get(masterCode);

                if (material == null) {
                    System.err.println("HATA: Malzeme bulunamadı, satır atlandı → " + tx.getMASTER_CODE());
                    continue; // veya throw new BaseException(...) ile işlemi durdur
                }

                //Malzeme Fiyat Geçmişi Kayıt İşlemi
                saveMaterialPrice(material,
                        LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy")),
                        customer.getName(),
                        tx.getPRICE(),
                        tx.getQUANTITY(),
                        InvoiceType.PURCHASE);

                //Fatura Kalemleri
                PurchaseInvoiceItem item = new PurchaseInvoiceItem();
                item.setPurchaseInvoice(invoice);
                item.setMaterial(material);

                item.setQuantity(tx.getQUANTITY());
                item.setUnitPrice(tx.getPRICE());
                item.setKdv(tx.getVAT_RATE());
                item.setKdvTutar(tx.getVAT_AMOUNT());
                item.setLineTotal(tx.getTOTAL());

                System.out.println(
                        "ITEM → " + material.getCode() + " | ID=" + material.getId()
                );
                itemList.add(item);
            }

            invoice.setItems(itemList);

            BigDecimal currentBalance = customer.getBalance() != null ? customer.getBalance() : BigDecimal.ZERO;
            customer.setBalance(currentBalance.subtract(invoice.getTotalPrice()));

            customerRepository.save(customer);
            // Cascade ALL sayesinde item'lar otomatik kaydedilir
            invoiceRepository.save(invoice);
        }
    }

    @Transactional
    public void importSalesInvoices(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(SalesInvoicesXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        SalesInvoicesXml invoicesXml = (SalesInvoicesXml) unmarshaller.unmarshal(file.getInputStream());

        Map<String, Material> materialMap = materialRepository.findAll()
                .stream().collect(Collectors.toMap(m -> m.getCode().trim().toUpperCase(),
                        m -> m));

        for (SalesInvoiceXml xmlInv : invoicesXml.getSalesInvoices()) {
            SalesInvoice invoice = new SalesInvoice();

            invoice.setFileNo(xmlInv.getNUMBER());
            invoice.setDate(LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy")));
            invoice.setTotalPrice(xmlInv.getTOTAL_NET());
            invoice.setKdvToplam(xmlInv.getTOTAL_VAT());

            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE()).orElse(null);

            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + xmlInv.getARP_CODE() + " → Fatura atlandı");
                continue; // müşteri yoksa faturayı atla
            }

            invoice.setCustomer(customer);

            List<SalesInvoiceItem> itemList = new ArrayList<>();

            for (TransactionXml tx : xmlInv.getTRANSACTIONS().getList()) {
                if (tx.getMASTER_CODE() == null || tx.getMASTER_CODE().isBlank()) {
                    System.out.println("Atlanan satır (MASTER_CODE boş)");
                    continue;
                }

                Material material = materialMap.get(tx.getMASTER_CODE().trim().toUpperCase());

                if (material == null) {
                    System.err.println("HATA: Malzeme bulunamadı, satır atlandı → " + tx.getMASTER_CODE());
                    continue;
                }

                saveMaterialPrice(material,
                        LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy")),
                        customer.getName(),
                        tx.getPRICE(),
                        tx.getQUANTITY(),
                        InvoiceType.SALES);

                // Fatura Kalemleri
                SalesInvoiceItem item = new SalesInvoiceItem();

                item.setMaterial(material);
                item.setQuantity(tx.getQUANTITY());
                item.setUnitPrice(tx.getPRICE());
                item.setKdv(tx.getVAT_RATE());
                item.setKdvTutar(tx.getVAT_AMOUNT());
                item.setLineTotal(tx.getTOTAL_NET());

                itemList.add(item);
                item.setSalesInvoice(invoice);

            }
            BigDecimal currentBalance = customer.getBalance() != null ? customer.getBalance() : BigDecimal.ZERO;
// Satış faturası tutarını bakiyeye ekliyoruz
            customer.setBalance(currentBalance.add(invoice.getTotalPrice()));

            customerRepository.save(customer); // Müşteriyi güncelle
            invoice.setItems(itemList);
            salesInvoiceRepository.save(invoice);
        }

    }

    @Transactional
    public void importMaterials(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(ItemsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        ItemsXml itemsXml = (ItemsXml) unmarshaller.unmarshal(file.getInputStream());

        for (MaterialXml m : itemsXml.getItems()) {

            if (m.getCODE() == null || m.getCODE().isBlank()) {
                continue;
            }

            String code = m.getCODE().trim().toUpperCase();
            Optional<Material> existing = materialRepository.findByCode(code);

            if (existing.isPresent()) {
                // istersek sadece boş alanları doldururuz
                Material material = existing.get();
                if (material.getComment() == null || material.getComment().isBlank()) {
                    material.setComment(m.getNAME());
                }
            } else {
                Material material = new Material();
                material.setCode(code);
                material.setComment(m.getNAME());
                material.setUnit(MaterialUnit.ADET);
                materialRepository.save(material);
            }

        }
    }

    @Transactional
    public void importCustomers(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CustomersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CustomersXml customersXml = (CustomersXml) unmarshaller.unmarshal(file.getInputStream());

        for (CustomerXml c : customersXml.getCustomers()) {
            Customer customer = new Customer();

            customer.setCode(c.getCODE());
            customer.setName(c.getTITLE());
            customer.setCountry("TÜRKİYE");
            customer.setLocal(c.getCITY());
            customer.setDistrict(c.getDISTRICT());
            customer.setAddress(c.getADDRESS1());

            BigDecimal initialRisk = parseBigDecimal(c.getACC_RISK_TOTAL());
            customer.setOpeningBalance(initialRisk);
            customer.setBalance(initialRisk);
            customer.setVdNo(c.getTAX_ID());

            customerRepository.save(customer);
        }
    }

    @Transactional
    public void importCollections(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CollectionsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CollectionsXml collectionsXml = (CollectionsXml) unmarshaller.unmarshal(file.getInputStream());

        for (CollectionXml c : collectionsXml.getCollections()) {

            String arpCode = null;
            if (c.getAttachmentArp() != null && c.getAttachmentArp().getTransaction() != null) {
                arpCode = c.getAttachmentArp().getTransaction().getArpCode();
            }

            // TYPE 71 / 72 kayıtlarında ARP_CODE eksikse SD_CODE kullan
            if (arpCode == null || arpCode.isBlank()) {
                if (c.getTYPE() == 71 || c.getTYPE() == 72) {
                    arpCode = c.getSD_CODE();
                } else {
                    System.out.println("ARP_CODE eksik, kayıt atlandı: " + c.getNUMBER());
                    continue;
                }
            }

            Customer customer = customerRepository.findByCode(arpCode).orElse(null);
            if (customer == null) {
                System.out.println("Müşteri bulunamadı: " + arpCode + " - kayıt: " + c.getNUMBER());
                continue;
            }

            LocalDate date;
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
                date = LocalDate.parse(c.getDATE(), formatter);
            } catch (Exception e) {
                System.out.println("Hatalı tarih formatı: " + c.getDATE() + " - kayıt: " + c.getNUMBER());
                continue;
            }

            BigDecimal total = parseBigDecimal(c.getAMOUNT());

            Integer type = c.getTYPE();
            String sdCode = c.getSD_CODE();
            Integer sign = (c.getSIGN() == null ? 1 : c.getSIGN());

            // --- AYRIM ---

            if (type == 11) {
                // Tahsilat
                ReceivedCollection rc = new ReceivedCollection();
                rc.setCustomer(customer);
                rc.setDate(date);
                rc.setPrice(total);
                rc.setCustomerName(customer.getName());
                rc.setComment(c.getDESCRIPTION());
                customer.setBalance(customer.getBalance().subtract(total));
                customerRepository.save(customer);
                receivedCollectionRepository.save(rc);
                receivedCollectionRepository.save(rc);

            } else if (type == 12 && "2".equals(sdCode)) {
                // Firmaya ödeme
                PaymentCompany py = new PaymentCompany();
                py.setCustomer(customer);
                py.setDate(date);
                py.setComment(c.getDESCRIPTION());
                py.setCustomerName(customer.getName());
                py.setPrice(total);
                customer.setBalance(customer.getBalance().add(total));
                customerRepository.save(customer);
                paymentCompanyRepository.save(py);
                paymentCompanyRepository.save(py);

            }

        }
    }

    @Transactional
    public void importPayrolls(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(PayrollsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        PayrollsXml rollsXml = (PayrollsXml) unmarshaller.unmarshal(file.getInputStream());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        for (PayrollRollXml roll : rollsXml.getRolls()) {
            String customerCode = roll.getMasterCode();
            Customer customer = customerRepository.findByCode(customerCode)
                    .orElse(null);
            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + customerCode + " -> Bordro atlandı.");
                continue;
            }
            PayrollModel model = (roll.getType() <= 2) ? PayrollModel.INPUT : PayrollModel.OUTPUT;

            if (roll.getTransactions() != null && roll.getTransactions().getList() != null) {
                for (PayrollTxXml tx : roll.getTransactions().getList()) {
                    Payroll payroll = new Payroll();
                    payroll.setCustomer(customer);
                    payroll.setFileNo(tx.getNumber());

                    BigDecimal amount = parseBigDecimal(tx.getAmount());
                    payroll.setAmount(amount);

                    payroll.setTransactionDate(LocalDate.parse(tx.getDate(), dtf));
                    payroll.setExpiredDate(LocalDate.parse(tx.getDueDate(), dtf));
                    payroll.setPayrollModel(model);

                    // Varsayılan tip çek olsun (XML'den çek-senet ayrımı da yapılabilir)
                    payroll.setPayrollType(PayrollType.CHEQUE);

                    // 3. Müşteri Bakiyesini Güncelle
                    if (model == PayrollModel.INPUT) {
                        // Müşteriden çek aldık, borcu azalır (Subtract)
                        customer.setBalance(customer.getBalance().subtract(amount));
                    } else {
                        // Müşteriye çek verdik veya ciro ettik, borcu/alacağı artar (Add)
                        customer.setBalance(customer.getBalance().add(amount));
                    }

                    payrollRepository.save(payroll);
                }
            }
            customerRepository.save(customer);
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(value.replace(",", "."));
    }

    private void saveMaterialPrice(Material material, LocalDate date, String customerName, BigDecimal price, BigDecimal quantity, InvoiceType invoiceType) {
        MaterialPriceHistory materialPriceHistory = new MaterialPriceHistory();

        materialPriceHistory.setMaterial(material);
        materialPriceHistory.setPrice(price);
        materialPriceHistory.setInvoiceType(invoiceType);
        materialPriceHistory.setDate(date);
        materialPriceHistory.setCustomerName(customerName);
        materialPriceHistory.setQuantity(quantity);

        materialPriceHistoryRepository.save(materialPriceHistory);
    }


}
