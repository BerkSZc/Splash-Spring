package com.berksozcu.xml.service;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
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
import com.berksozcu.xml.entites.opening_balances.ArpTransactionXml;
import com.berksozcu.xml.entites.opening_balances.ArpVoucherXml;
import com.berksozcu.xml.entites.opening_balances.ArpVouchersXml;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    @Autowired
    private OpeningVoucherRepository openingBalanceRepository;

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

            if (invoiceRepository.existsByFileNo(xmlInv.getDOC_NUMBER())) {
                System.out.println("Fatura NO mevcut: " + xmlInv.getDOC_NUMBER());
                continue;
            }

            PurchaseInvoice invoice = new PurchaseInvoice();
            LocalDate date = LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy"));
            // Tarih Logo formatı: 01.01.2025
            invoice.setDate(date);

            invoice.setFileNo(xmlInv.getDOC_NUMBER());

            BigDecimal kdvToplam = xmlInv.getTOTAL_VAT() != null ? xmlInv.getTOTAL_VAT() : BigDecimal.ZERO;
            invoice.setKdvToplam(kdvToplam.setScale(2, RoundingMode.HALF_UP));

            BigDecimal totalPrice = xmlInv.getTOTAL_NET() != null ? xmlInv.getTOTAL_NET() : BigDecimal.ZERO;
            invoice.setTotalPrice(totalPrice.setScale(2, RoundingMode.HALF_UP));
            // Customer eşleştirme
            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE()).orElse(null);

            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + xmlInv.getARP_CODE() + " → Fatura atlandı");
                continue; // müşteri yoksa faturayı atla
            }

            invoice.setCustomer(customer);

            List<PurchaseInvoiceItem> itemList = new ArrayList<>();

            LocalDate start = LocalDate.of(date.getYear(), 1, 1);
            LocalDate end = LocalDate.of(date.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> {
                        OpeningVoucher newVoucher = new OpeningVoucher();
                        newVoucher.setCustomer(customer);
                        newVoucher.setCustomerName(customer.getName());
                        newVoucher.setFileNo("001");
                        newVoucher.setDescription("Eklenmiş");
                        newVoucher.setDate(LocalDate.of(date.getYear(), 1, 1)); // Yılın ilk günü olarak işaretle
                        newVoucher.setFinalBalance(BigDecimal.ZERO);
                        newVoucher.setDebit(BigDecimal.ZERO);
                        newVoucher.setCredit(BigDecimal.ZERO);
                        newVoucher.setYearlyDebit(BigDecimal.ZERO);
                        newVoucher.setYearlyCredit(BigDecimal.ZERO);
                        return newVoucher;
                    });

            if (voucher.getFinalBalance() == null) {
                voucher.setFinalBalance(BigDecimal.ZERO);
            }

            // Fatura satırları
            if (xmlInv.getTRANSACTIONS() != null && xmlInv.getTRANSACTIONS().getList() != null) {
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
                            InvoiceType.PURCHASE,
                            customer);

                    //Fatura Kalemleri
                    PurchaseInvoiceItem item = new PurchaseInvoiceItem();
                    item.setPurchaseInvoice(invoice);
                    item.setMaterial(material);

                    BigDecimal quantity = tx.getQUANTITY() != null ? tx.getQUANTITY() : BigDecimal.ZERO;
                    BigDecimal unitPrice = tx.getPRICE() != null ? tx.getPRICE() : BigDecimal.ZERO;
                    BigDecimal kdv = tx.getVAT_RATE() != null ? tx.getVAT_RATE() : BigDecimal.ZERO;
                    BigDecimal kdvTutar = tx.getVAT_AMOUNT() != null ? tx.getVAT_AMOUNT() : BigDecimal.ZERO;
                    BigDecimal lineTotal = tx.getTOTAL() != null ? tx.getTOTAL() : BigDecimal.ZERO;

                    item.setQuantity(quantity.setScale(2, RoundingMode.HALF_UP));
                    item.setUnitPrice(unitPrice.setScale(2, RoundingMode.HALF_UP));
                    item.setKdv(kdv.setScale(2, RoundingMode.HALF_UP));
                    item.setKdvTutar(kdvTutar.setScale(2, RoundingMode.HALF_UP));
                    item.setLineTotal(lineTotal.setScale(2, RoundingMode.HALF_UP));

                    System.out.println(
                            "ITEM → " + material.getCode() + " | ID=" + material.getId()
                    );
                    itemList.add(item);
                }

                invoice.setItems(itemList);

                voucher.setFinalBalance(voucher.getFinalBalance().subtract(invoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP));
                voucher.setCredit(voucher.getCredit().add(invoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP));
                openingBalanceRepository.save(voucher);
                customerRepository.save(customer);
                // Cascade ALL sayesinde item'lar otomatik kaydedilir
                invoiceRepository.save(invoice);
            }
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

            if (salesInvoiceRepository.existsByFileNo(xmlInv.getNUMBER())) {
                System.out.println("Fatura no mevcut: " + xmlInv.getNUMBER());
                continue;
            }

            SalesInvoice invoice = new SalesInvoice();
            LocalDate date = LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy"));

            invoice.setFileNo(xmlInv.getNUMBER());
            invoice.setDate(date);
            BigDecimal totalPrice = xmlInv.getTOTAL_NET().setScale(2, RoundingMode.HALF_UP);
            invoice.setTotalPrice(totalPrice);

            invoice.setKdvToplam(xmlInv.getTOTAL_VAT().setScale(2, RoundingMode.HALF_UP));

            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE()).orElse(null);

            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + xmlInv.getARP_CODE() + " → Fatura atlandı");
                continue; // müşteri yoksa faturayı atla
            }

            invoice.setCustomer(customer);

            List<SalesInvoiceItem> itemList = new ArrayList<>();

            LocalDate start = LocalDate.of(date.getYear(), 1, 1);
            LocalDate end = LocalDate.of(date.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> {
                        OpeningVoucher newVoucher = new OpeningVoucher();
                        newVoucher.setCustomer(customer);
                        newVoucher.setCustomerName(customer.getName());
                        newVoucher.setFileNo("001");
                        newVoucher.setDescription("Eklenmiş");
                        newVoucher.setDate(LocalDate.of(date.getYear(), 1, 1)); // Yılın ilk günü olarak işaretle
                        newVoucher.setFinalBalance(BigDecimal.ZERO);
                        newVoucher.setDebit(BigDecimal.ZERO);
                        newVoucher.setCredit(BigDecimal.ZERO);
                        newVoucher.setYearlyDebit(BigDecimal.ZERO);
                        newVoucher.setYearlyCredit(BigDecimal.ZERO);
                        return newVoucher;
                    });

            if (voucher.getFinalBalance() == null) {
                voucher.setFinalBalance(BigDecimal.ZERO);
            }

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
                        InvoiceType.SALES,
                        customer);

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
            // Satış faturası tutarını bakiyeye ekliyoruz
            voucher.setFinalBalance(voucher.getFinalBalance().add(invoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP));
            voucher.setDebit(voucher.getDebit().add(invoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP));

            openingBalanceRepository.save(voucher);
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

        Set<String> existingMaterials = materialRepository.findAll()
                .stream().map(Material::getCode).collect(Collectors.toSet());

        for (MaterialXml m : itemsXml.getItems()) {
            if (m.getCODE() == null || m.getCODE().isBlank()) continue;

            String code = m.getCODE().trim().toUpperCase();

            if (existingMaterials.contains(code)) {
                System.out.println("Malzeme Kodu mevcut atlandı: " + code);
                continue;
            }

            Material material = new Material();
            material.setCode(code);
            material.setComment(m.getNAME());
            material.setUnit(MaterialUnit.ADET);
            material.setPurchasePrice(parseBigDecimal(m.getPURCHASE_PRICE()));
            material.setSalesPrice(parseBigDecimal(m.getSALES_PRICE()));
            materialRepository.save(material);

            existingMaterials.add(code);
        }
    }

    @Transactional
    public void importCustomers(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CustomersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CustomersXml customersXml = (CustomersXml) unmarshaller.unmarshal(file.getInputStream());

        for (CustomerXml c : customersXml.getCustomers()) {

            if (customerRepository.existsByCode(c.getCODE())) {
                System.out.println("Müşteri kodu mevcut: " + c.getCODE());
                continue;
            }
            Customer customer = new Customer();

            customer.setCode(c.getCODE());
            customer.setName(c.getTITLE());
            customer.setCountry("TÜRKİYE");
            customer.setLocal(c.getCITY());
            customer.setDistrict(c.getDISTRICT());
            customer.setAddress(c.getADDRESS1());

            customer.setVdNo(c.getTAX_ID());

            customerRepository.save(customer);
        }
    }

    @Transactional
    public void importCollections(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CollectionsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CollectionsXml collectionsXml = (CollectionsXml) unmarshaller.unmarshal(file.getInputStream());


        Set<String> existingCollections = receivedCollectionRepository.findAll()
                .stream()
                .map(ReceivedCollection::getFileNo)
                .collect(Collectors.toSet());

        Set<String> existingPayments = paymentCompanyRepository.findAll()
                .stream().map(PaymentCompany::getFileNo)
                .collect(Collectors.toSet());

        for (CollectionXml c : collectionsXml.getCollections()) {

            String sdCode = c.getSD_CODE();
            Integer type = c.getTYPE();

            if (type == 11 && existingCollections.contains(c.getNUMBER())) {
                System.out.println("Tahsilar Fişi mevcut: " + c.getNUMBER());
                continue;
            } else if (type == 12 && "2".equals(sdCode) && existingPayments.contains(c.getNUMBER())) {
                System.out.println("Ödeme Fişi mevcut: " + c.getNUMBER());
                continue;
            }

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


            // --- AYRIM ---

            LocalDate start = LocalDate.of(date.getYear(), 1, 1);
            LocalDate end = LocalDate.of(date.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> {
                        OpeningVoucher newVoucher = new OpeningVoucher();
                        newVoucher.setCustomer(customer);
                        newVoucher.setCustomerName(customer.getName());
                        newVoucher.setFileNo("001");
                        newVoucher.setDescription("Eklenmiş");
                        newVoucher.setDate(LocalDate.of(date.getYear(), 1, 1)); // Yılın ilk günü olarak işaretle
                        newVoucher.setFinalBalance(BigDecimal.ZERO);
                        newVoucher.setDebit(BigDecimal.ZERO);
                        newVoucher.setCredit(BigDecimal.ZERO);
                        newVoucher.setYearlyDebit(BigDecimal.ZERO);
                        newVoucher.setYearlyCredit(BigDecimal.ZERO);
                        return newVoucher;
                    });

            if (voucher.getFinalBalance() == null) {
                voucher.setFinalBalance(BigDecimal.ZERO);
            }

            if (type == 11) {
                // Tahsilat
                ReceivedCollection rc = new ReceivedCollection();
                rc.setCustomer(customer);
                rc.setDate(date);
                rc.setPrice(total);
                rc.setFileNo(c.getNUMBER());
                rc.setCustomerName(customer.getName());
                rc.setComment(c.getDESCRIPTION());
                voucher.setFinalBalance(voucher.getFinalBalance().subtract(total).setScale(2, RoundingMode.HALF_UP));
                voucher.setCredit(voucher.getCredit().add(total).setScale(2, RoundingMode.HALF_UP));
                receivedCollectionRepository.save(rc);

                existingCollections.add(c.getNUMBER());

                openingBalanceRepository.save(voucher);
                customerRepository.save(customer);
            } else if (type == 12 && "2".equals(sdCode)) {
                // Firmaya ödeme
                PaymentCompany py = new PaymentCompany();
                py.setCustomer(customer);
                py.setDate(date);
                py.setComment(c.getDESCRIPTION());
                py.setFileNo(c.getNUMBER());
                py.setCustomerName(customer.getName());
                py.setPrice(total);
                voucher.setFinalBalance(voucher.getFinalBalance().add(total).setScale(2, RoundingMode.HALF_UP));
                voucher.setDebit(voucher.getDebit().add(total).setScale(2, RoundingMode.HALF_UP));
                paymentCompanyRepository.save(py);

                existingPayments.add(c.getNUMBER());

                openingBalanceRepository.save(voucher);
                customerRepository.save(customer);
            }

        }
    }

    @Transactional
    public void importPayrolls(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(PayrollsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        PayrollsXml rollsXml = (PayrollsXml) unmarshaller.unmarshal(file.getInputStream());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        Set<String> existingPayrolls = payrollRepository.findAll()
                .stream().map(Payroll::getFileNo)
                .collect(Collectors.toSet());

        for (PayrollRollXml roll : rollsXml.getRolls()) {

            String customerCode = roll.getMasterCode();
            Customer customer = customerRepository.findByCode(customerCode)
                    .orElse(null);
            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + customerCode + " -> Bordro atlandı.");
                continue;
            }
            PayrollModel model = (roll.getType() != null && roll.getType() <= 2) ? PayrollModel.INPUT : PayrollModel.OUTPUT;

            LocalDate headerDate = LocalDate.parse(roll.getDate(), dtf);

            LocalDate start = LocalDate.of(headerDate.getYear(), 1, 1);
            LocalDate end = LocalDate.of(headerDate.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> {
                        OpeningVoucher newVoucher = new OpeningVoucher();
                        newVoucher.setCustomer(customer);
                        newVoucher.setCustomerName(customer.getName());
                        newVoucher.setFileNo("001");
                        newVoucher.setDescription("Eklenmiş");
                        newVoucher.setDate(LocalDate.of(headerDate.getYear(), 1, 1)); // Yılın ilk günü olarak işaretle
                        newVoucher.setFinalBalance(BigDecimal.ZERO);
                        newVoucher.setDebit(BigDecimal.ZERO);
                        newVoucher.setCredit(BigDecimal.ZERO);
                        newVoucher.setYearlyDebit(BigDecimal.ZERO);
                        newVoucher.setYearlyCredit(BigDecimal.ZERO);
                        return newVoucher;
                    });

            if (voucher.getFinalBalance() == null) {
                voucher.setFinalBalance(BigDecimal.ZERO);
            }

            if (roll.getTransactions() != null && roll.getTransactions().getList() != null) {
                for (PayrollTxXml tx : roll.getTransactions().getList()) {
                    if (existingPayrolls.contains(tx.getNumber())) {
                        System.out.println("İşlem no mevcut: " + tx.getNumber());
                        continue;
                    }
                    Payroll payroll = new Payroll();
                    payroll.setCustomer(customer);
                    payroll.setFileNo(tx.getNumber());

                    BigDecimal amount = parseBigDecimal(tx.getAmount()).setScale(2, RoundingMode.HALF_UP);
                    payroll.setAmount(amount);

                    payroll.setTransactionDate(headerDate);
                    payroll.setExpiredDate(LocalDate.parse(tx.getDueDate(), dtf));
                    payroll.setPayrollModel(model);


                    // Varsayılan tip çek olsun (XML'den çek-senet ayrımı da yapılabilir)
                    payroll.setPayrollType(PayrollType.CHEQUE);


                    // 3. Müşteri Bakiyesini Güncelle
                    if (model == PayrollModel.INPUT) {
                        // Müşteriden çek aldık, borcu azalır (Subtract)
                        voucher.setFinalBalance(voucher.getFinalBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP));
                        voucher.setCredit(voucher.getCredit().add(amount).setScale(2, RoundingMode.HALF_UP));

                    } else {
                        // Müşteriye çek verdik veya ciro ettik, borcu/alacağı artar (Add)
                        voucher.setFinalBalance(voucher.getFinalBalance().add(amount).setScale(2, RoundingMode.HALF_UP));
                        voucher.setDebit(voucher.getDebit().add(amount).setScale(2, RoundingMode.HALF_UP));

                    }

                    payrollRepository.save(payroll);
                    existingPayrolls.add(tx.getNumber());

                }

            }
            openingBalanceRepository.save(voucher);
            customerRepository.save(customer);
        }
    }

    @Transactional
    public void importOpeningVouchers(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(ArpVouchersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        ArpVouchersXml vouchersXml = (ArpVouchersXml) unmarshaller.unmarshal(file.getInputStream());

        if (vouchersXml.getVouchers() == null) return;

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        for (ArpVoucherXml voucherXml : vouchersXml.getVouchers()) {
            if (voucherXml.getTransactions() == null || voucherXml.getTransactions().getList() == null) continue;


            LocalDate voucherDate;
            try {
                voucherDate = LocalDate.parse(voucherXml.getDate(), dtf);
            } catch (Exception e) {
                voucherDate = LocalDate.of(LocalDate.now().getYear(), 1, 1);
            }

            for (ArpTransactionXml tx : voucherXml.getTransactions().getList()) {
                String arpCode = tx.getARP_CODE() != null ? tx.getARP_CODE().trim() : "";
                Customer customer = customerRepository.findByCode(arpCode).orElse(null);

                if (customer == null) continue;


                BigDecimal newDebit = parseBigDecimal(tx.getDEBIT()).setScale(2, RoundingMode.HALF_UP);
                BigDecimal newCredit = parseBigDecimal(tx.getCREDIT()).setScale(2, RoundingMode.HALF_UP);


                OpeningVoucher openingBalance = openingBalanceRepository
                        .findByCustomerIdAndDate(customer.getId(), voucherDate)
                        .orElse(new OpeningVoucher());

                if (openingBalance.getId() == null) {
                    openingBalance.setCustomer(customer);
                    openingBalance.setCustomerName(customer.getName());
                    openingBalance.setDate(voucherDate);
                    openingBalance.setFinalBalance(BigDecimal.ZERO);
                    openingBalance.setDebit(BigDecimal.ZERO);
                    openingBalance.setCredit(BigDecimal.ZERO);
                    openingBalance.setYearlyCredit(BigDecimal.ZERO);
                    openingBalance.setYearlyDebit(BigDecimal.ZERO);
                }


                openingBalance.setYearlyCredit(openingBalance.getYearlyCredit().add(newCredit));
                openingBalance.setYearlyDebit(openingBalance.getYearlyDebit().add(newDebit));

                openingBalance.setDebit(openingBalance.getDebit().add(newDebit));
                openingBalance.setCredit(openingBalance.getCredit().add(newCredit));

                BigDecimal rowEffect = newDebit.subtract(newCredit);

                openingBalance.setFinalBalance(openingBalance.getFinalBalance().add(rowEffect));
                openingBalance.setFileNo(tx.getTRANNO());
                openingBalance.setDescription(tx.getDESCRIPTION() != null ? tx.getDESCRIPTION().trim() : "Devir Bakiye");

                openingBalanceRepository.save(openingBalance);
                customerRepository.save(customer);
            }
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(value.replace(",", "."));
    }

    private void saveMaterialPrice(Material material, LocalDate date, String customerName, BigDecimal price, BigDecimal quantity, InvoiceType invoiceType, Customer customer) {
        MaterialPriceHistory materialPriceHistory = new MaterialPriceHistory();

        materialPriceHistory.setMaterial(material);
        materialPriceHistory.setPrice(price);
        materialPriceHistory.setInvoiceType(invoiceType);
        materialPriceHistory.setDate(date);
        materialPriceHistory.setCustomerName(customerName);
        materialPriceHistory.setQuantity(quantity);
        materialPriceHistory.setCustomer(customer);
        materialPriceHistoryRepository.save(materialPriceHistory);
    }


}
