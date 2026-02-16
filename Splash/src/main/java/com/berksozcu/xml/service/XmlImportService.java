package com.berksozcu.xml.service;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.collections.ReceivedCollection;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.material.Currency;
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
import com.berksozcu.xml.entites.materials.*;
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
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
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

    @Autowired
    private CompanyRepository companyRepository;

    @Transactional
    public void importPurchaseInvoices(MultipartFile file, String schemaName) throws Exception {

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

        Long invoiceCounter = 1L;

        for (InvoiceXml xmlInv : invoicesXml.getInvoices()) {

            if (invoiceRepository.existsByFileNo(xmlInv.getDOC_NUMBER())) {
                System.out.println("Fatura NO mevcut: " + xmlInv.getDOC_NUMBER());
                continue;
            }

            if (xmlInv.getCANCELLED() != null && xmlInv.getCANCELLED().equals(1)) {
                System.out.println("İptal olmuş fatura atlandı: " + xmlInv.getDOC_NUMBER());
                continue;
            }

            if (xmlInv.getDOC_NUMBER() == null || xmlInv.getDOC_NUMBER().isBlank()) {
                System.out.println("Fatura No'su boş veya mevcut değil");
                continue;
            }

            PurchaseInvoice invoice = new PurchaseInvoice();
            LocalDate date = LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy"));
            // Tarih Logo formatı: 01.01.2025
            invoice.setDate(date);

            Company company = getCompany(schemaName);

            invoice.setFileNo(Objects.requireNonNullElse(xmlInv.getDOC_NUMBER(), ""));
            invoice.setCompany(company);
            invoice.setKdvToplam(safeGet(xmlInv.getTOTAL_VAT()).setScale(2, RoundingMode.HALF_UP));
            invoice.setEurSellingRate(BigDecimal.ONE);
            invoice.setUsdSellingRate(BigDecimal.ONE);

            invoice.setTotalPrice(safeGet(xmlInv.getTOTAL_NET()).setScale(2, RoundingMode.HALF_UP));
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
                    .orElseGet(() -> getDefaultVoucher(company, customer, start));

            voucher.setCompany(getCompany(schemaName));
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
                            customer,
                            invoiceCounter);

                    //Fatura Kalemleri
                    PurchaseInvoiceItem item = new PurchaseInvoiceItem();
                    item.setPurchaseInvoice(invoice);
                    item.setMaterial(material);

                    item.setQuantity(safeGet(tx.getQUANTITY()).setScale(2, RoundingMode.HALF_UP));
                    item.setUnitPrice(safeGet(tx.getPRICE()).setScale(2, RoundingMode.HALF_UP));
                    item.setKdv(safeGet(tx.getVAT_RATE()).setScale(2, RoundingMode.HALF_UP));
                    item.setKdvTutar(safeGet(tx.getVAT_AMOUNT()).setScale(2, RoundingMode.HALF_UP));
                    item.setLineTotal(safeGet(tx.getTOTAL()).setScale(2, RoundingMode.HALF_UP));

                    System.out.println(
                            "ITEM → " + material.getCode() + " | ID=" + material.getId()
                    );
                    itemList.add(item);
                }
                invoiceCounter++;

                invoice.setItems(itemList);

                voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(invoice.getTotalPrice())).setScale(2, RoundingMode.HALF_UP));
                voucher.setCredit(safeGet(voucher.getCredit()).add(safeGet(invoice.getTotalPrice())).setScale(2, RoundingMode.HALF_UP));
                openingBalanceRepository.save(voucher);
                // Cascade ALL sayesinde item'lar otomatik kaydedilir
                invoiceRepository.save(invoice);
            }
        }
    }

    @Transactional
    public void importSalesInvoices(MultipartFile file, String schemaName) throws Exception {
        JAXBContext context = JAXBContext.newInstance(SalesInvoicesXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        SalesInvoicesXml invoicesXml = (SalesInvoicesXml) unmarshaller.unmarshal(file.getInputStream());

        Map<String, Material> materialMap = materialRepository.findAll()
                .stream().collect(Collectors.toMap(m -> m.getCode().trim().toUpperCase(),
                        m -> m));

        Long invoiceCounter = 1L;
        for (SalesInvoiceXml xmlInv : invoicesXml.getSalesInvoices()) {

            if (salesInvoiceRepository.existsByFileNo(xmlInv.getNUMBER())) {
                System.out.println("Fatura no mevcut: " + xmlInv.getNUMBER());
                continue;
            }

            if (xmlInv.getCANCELLED() != null && xmlInv.getCANCELLED().equals(1)) {
                System.out.println("İptal edilmiş Fatura atlandı: " + xmlInv.getNUMBER());
                continue;
            }

            SalesInvoice invoice = new SalesInvoice();
            LocalDate date = LocalDate.parse(xmlInv.getDATE(), DateTimeFormatter.ofPattern("dd.MM.yyyy"));

            invoice.setFileNo(Objects.requireNonNullElse(xmlInv.getNUMBER(), ""));
            invoice.setDate(date);
            invoice.setCompany(getCompany(schemaName));
            BigDecimal totalPrice = safeGet(xmlInv.getTOTAL_NET()).setScale(2, RoundingMode.HALF_UP);
            invoice.setTotalPrice(totalPrice);
            invoice.setEurSellingRate(BigDecimal.ONE);
            invoice.setUsdSellingRate(BigDecimal.ONE);

            invoice.setKdvToplam(safeGet(xmlInv.getTOTAL_VAT()).setScale(2, RoundingMode.HALF_UP));

            Customer customer = customerRepository.findByCode(xmlInv.getARP_CODE()).orElse(null);
            invoice.setCustomer(customer);

            if (customer == null) {
                System.err.println("Müşteri bulunamadı: " + xmlInv.getARP_CODE() + " → Fatura atlandı");
                continue; // müşteri yoksa faturayı atla
            }

            List<SalesInvoiceItem> itemList = new ArrayList<>();

            LocalDate start = LocalDate.of(date.getYear(), 1, 1);
            LocalDate end = LocalDate.of(date.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), customer, start));

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
                        customer,
                        invoiceCounter);

                // Fatura Kalemleri
                SalesInvoiceItem item = new SalesInvoiceItem();

                item.setMaterial(material);
                item.setQuantity(safeGet(tx.getQUANTITY()));
                item.setUnitPrice(safeGet(tx.getPRICE()));
                item.setKdv(safeGet(tx.getVAT_RATE()));
                item.setKdvTutar(safeGet(tx.getVAT_AMOUNT()));
                item.setLineTotal(safeGet(tx.getTOTAL_NET()));

                itemList.add(item);
                item.setSalesInvoice(invoice);
            }
            invoiceCounter++;
            // Satış faturası tutarını bakiyeye ekliyoruz
            voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(invoice.getTotalPrice())).setScale(2, RoundingMode.HALF_UP));
            voucher.setDebit(safeGet(voucher.getDebit()).add(safeGet(invoice.getTotalPrice())).setScale(2, RoundingMode.HALF_UP));

            invoice.setItems(itemList);
            openingBalanceRepository.save(voucher);
            salesInvoiceRepository.save(invoice);
        }
    }

    @Transactional
    public void importMaterials(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(ItemsXml.class, PurchasePriceXmlList.class, SalesPriceXmlList.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        Object unmarshalledObject = unmarshaller.unmarshal(file.getInputStream());

        if(unmarshalledObject instanceof ItemsXml itemsXml) {
            processMaterialCards(itemsXml);
        }
        else if(unmarshalledObject instanceof PurchasePriceXmlList purchasePriceXmlList) {
            processPrices(purchasePriceXmlList, true);
        }
        else if(unmarshalledObject instanceof SalesPriceXmlList salesPriceXmlList) {
            processPrices(salesPriceXmlList, false);
        }

    }

    @Transactional
    public void importCustomers(MultipartFile file) throws Exception {
        JAXBContext context = JAXBContext.newInstance(CustomersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();

        CustomersXml customersXml = (CustomersXml) unmarshaller.unmarshal(file.getInputStream());

        for (CustomerXml c : customersXml.getCustomers()) {
            String code = Objects.requireNonNullElse(c.getCODE().trim().toUpperCase(), "");

            if (customerRepository.existsByCode(code)) {
                System.out.println("Müşteri kodu mevcut: " + c.getCODE());
                continue;
            }
            Customer customer = new Customer();

            customer.setCode(code);
            customer.setName(Objects.requireNonNullElse(c.getTITLE(), ""));
            customer.setCountry("TÜRKİYE");
            customer.setLocal(Objects.requireNonNullElse(c.getCITY(), ""));
            customer.setDistrict(Objects.requireNonNullElse(c.getDISTRICT(), ""));
            customer.setAddress(Objects.requireNonNullElse(c.getADDRESS1(), ""));
            customer.setArchived(c.getRECORD_STATUS() != null && c.getRECORD_STATUS() == 1);

            customer.setVdNo(Objects.requireNonNullElse(c.getTAX_ID(), ""));

            customerRepository.save(customer);
        }
    }

    @Transactional
    public void importCollections(MultipartFile file, String schemaName) throws Exception {
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
            BigDecimal total = safeGet(parseBigDecimal(c.getAMOUNT()));

            // --- AYRIM ---

            LocalDate start = LocalDate.of(date.getYear(), 1, 1);
            LocalDate end = LocalDate.of(date.getYear(), 12, 31);

            OpeningVoucher voucher = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), customer, start));

            voucher.setCompany(getCompany(schemaName));
            if (type == 11) {
                // Tahsilat
                ReceivedCollection rc = new ReceivedCollection();
                rc.setCustomer(customer);
                rc.setDate(date);
                rc.setPrice(safeGet(total));
                rc.setFileNo(Objects.requireNonNullElse(c.getNUMBER(), ""));
                rc.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
                rc.setComment(Objects.requireNonNullElse(c.getDESCRIPTION(), ""));
                rc.setCompany(getCompany(schemaName));

                voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(total).setScale(2, RoundingMode.HALF_UP));
                voucher.setCredit(safeGet(voucher.getCredit()).add(total).setScale(2, RoundingMode.HALF_UP));
                existingCollections.add(c.getNUMBER());

                receivedCollectionRepository.save(rc);
                openingBalanceRepository.save(voucher);
            } else if (type == 12 && "2".equals(sdCode)) {
                // Firmaya ödeme
                PaymentCompany py = new PaymentCompany();
                py.setCustomer(customer);
                py.setDate(date);
                py.setComment(Objects.requireNonNullElse(customer.getName(), ""));
                py.setFileNo(Objects.requireNonNullElse(c.getNUMBER(), ""));
                py.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
                py.setPrice(safeGet(total));
                py.setCompany(getCompany(schemaName));

                voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(total).setScale(2, RoundingMode.HALF_UP));
                voucher.setDebit(safeGet(voucher.getDebit()).add(total).setScale(2, RoundingMode.HALF_UP));
                existingPayments.add(c.getNUMBER());

                paymentCompanyRepository.save(py);
                openingBalanceRepository.save(voucher);
            }
        }
    }

    @Transactional
    public void importPayrolls(MultipartFile file, String schemaName) throws Exception {
        JAXBContext context = JAXBContext.newInstance(PayrollsXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        PayrollsXml rollsXml = (PayrollsXml) unmarshaller.unmarshal(file.getInputStream());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        Set<String> existingPayrolls = payrollRepository.findAll()
                .stream().map(Payroll::getFileNo)
                .collect(Collectors.toSet());

        for (PayrollRollXml roll : rollsXml.getRolls()) {

            if (roll.getType() != null && roll.getType().equals(11)) {
                System.out.println(">>> İşlem bordrosu (11) yakalandı ve atlanıyor.");
                continue;
            }

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
                    .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), customer, start));

            if (roll.getTransactions() != null && roll.getTransactions().getList() != null) {
                for (PayrollTxXml tx : roll.getTransactions().getList()) {
                    if (existingPayrolls.contains(roll.getNumber() + "-" + tx.getNumber())) {
                        System.out.println("İşlem no mevcut: " + roll.getNumber() + "-" + tx.getNumber());
                        continue;
                    }

                    Payroll payroll = new Payroll();
                    payroll.setCustomer(customer);
                    payroll.setFileNo(roll.getNumber() + "-" + tx.getNumber());

                    BigDecimal amount = safeGet(parseBigDecimal(tx.getAmount())).setScale(2, RoundingMode.HALF_UP);
                    payroll.setAmount(safeGet(amount));

                    payroll.setTransactionDate(headerDate);
                    payroll.setExpiredDate(Objects.requireNonNullElse(LocalDate.parse(tx.getDueDate(), dtf), LocalDate.now()));
                    payroll.setPayrollModel(model);
                    payroll.setCompany(getCompany(schemaName));
                    payroll.setBankName(Objects.requireNonNullElse(tx.getBank_title(), ""));
                    payroll.setBankBranch(Objects.requireNonNullElse(tx.getBranch(), ""));

                    // Varsayılan tip çek olsun (XML'den çek-senet ayrımı da yapılabilir)
                    payroll.setPayrollType(PayrollType.CHEQUE);


                    // 3. Müşteri Bakiyesini Güncelle
                    if (model == PayrollModel.INPUT) {
                        // Müşteriden çek aldık, borcu azalır (Subtract)
                        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(amount).setScale(2, RoundingMode.HALF_UP));
                        voucher.setCredit(safeGet(voucher.getCredit()).add(amount).setScale(2, RoundingMode.HALF_UP));
                    } else {
                        // Müşteriye çek verdik veya ciro ettik, borcu/alacağı artar (Add)
                        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(amount).setScale(2, RoundingMode.HALF_UP));
                        voucher.setDebit(safeGet(voucher.getDebit()).add(amount).setScale(2, RoundingMode.HALF_UP));
                    }
                    payrollRepository.save(payroll);
                    existingPayrolls.add(tx.getNumber());
                }
            }
            openingBalanceRepository.save(voucher);
        }
    }

    @Transactional
    public void importOpeningVouchers(MultipartFile file, String schemaName) throws Exception {
        JAXBContext context = JAXBContext.newInstance(ArpVouchersXml.class);
        Unmarshaller unmarshaller = context.createUnmarshaller();
        ArpVouchersXml vouchersXml = (ArpVouchersXml) unmarshaller.unmarshal(file.getInputStream());

        if (vouchersXml.getVouchers() == null) return;

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        Map<String, BigDecimal[]> customerTotals = new HashMap<>();

        int targetYear = LocalDate.now().getYear();
        for (ArpVoucherXml voucherXml : vouchersXml.getVouchers()) {
            if (voucherXml.getTransactions() == null || voucherXml.getTransactions().getList() == null) continue;

            try {
                targetYear = LocalDate.parse(voucherXml.getDate(), dtf).getYear();

            } catch (Exception ignored) {
            }

            for (ArpTransactionXml tx : voucherXml.getTransactions().getList()) {

                String arpCode = (tx.getARP_CODE() != null) ? tx.getARP_CODE().trim() : "";
                Customer customer = customerRepository.findByCode(arpCode).orElse(null);

                if (customer == null) {
                    System.out.println("Müşteri kodu mevcut değil kod: " + arpCode);
                    continue;
                }

                BigDecimal newDebit = parseBigDecimal(tx.getDEBIT()).setScale(2, RoundingMode.HALF_UP);
                BigDecimal newCredit = parseBigDecimal(tx.getCREDIT()).setScale(2, RoundingMode.HALF_UP);

                customerTotals.computeIfAbsent(arpCode, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                customerTotals.get(arpCode)[0] = safeGet(customerTotals.get(arpCode)[0]).add(safeGet(newDebit));
                customerTotals.get(arpCode)[1] = safeGet(customerTotals.get(arpCode)[1]).add(safeGet(newCredit));
            }
        }
        LocalDate start = LocalDate.of(targetYear, 1, 1);
        LocalDate end = LocalDate.of(targetYear, 12, 31);

        for (Map.Entry<String, BigDecimal[]> entry : customerTotals.entrySet()) {
            String code = Objects.requireNonNullElse(entry.getKey(), "");
            BigDecimal totalDebit = safeGet(entry.getValue()[0]).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalCredit = safeGet(entry.getValue()[1]).setScale(2, RoundingMode.HALF_UP);

            Customer customer = customerRepository.findByCode(code).orElse(null);
            if (customer == null) continue;

            OpeningVoucher openingBalance = openingBalanceRepository
                    .findByCustomerIdAndDateBetween(customer.getId(), start, end)
                    .orElseGet(() -> getDefaultVoucher(getCompany(schemaName), customer, start));

            if ("Veri Ekleme Devir İşlemi".equals(openingBalance.getDescription())) {
                System.out.println("Devir Bilgisi Mevcut");
                continue;
            }

            openingBalance.setCompany(getCompany(schemaName));
            openingBalance.setYearlyCredit(safeGet(totalCredit));
            openingBalance.setYearlyDebit(safeGet(totalDebit));
            openingBalance.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
            openingBalance.setDebit(safeGet(openingBalance.getDebit()).add(safeGet(totalDebit)));
            openingBalance.setCredit(safeGet(openingBalance.getCredit()).add(safeGet(totalCredit)));

            BigDecimal rowEffect = safeGet(totalDebit).subtract(safeGet(totalCredit));

            openingBalance.setFinalBalance(safeGet(openingBalance.getFinalBalance()).add(safeGet(rowEffect)));
            openingBalance.setFileNo("Devir_2025");
            openingBalance.setDescription("Veri Ekleme Devir İşlemi");

            openingBalanceRepository.save(openingBalance);
        }
    }

    private void processMaterialCards(ItemsXml itemsXml) {
        Set<String> existingMaterials = materialRepository.findAll()
                .stream().map(Material::getCode).collect(Collectors.toSet());

        for (MaterialXml m : itemsXml.getItems()) {
            if (m.getCODE() == null || m.getCODE().isBlank()) continue;

            String code = Objects.requireNonNullElse(m.getCODE().trim().toUpperCase(), "") ;

            if (existingMaterials.contains(code)) {
                System.out.println("Malzeme Kodu mevcut atlandı: " + code);
                continue;
            }

            Material material = new Material();
            material.setCode(code);
            material.setComment(Objects.requireNonNullElse(m.getNAME(), ""));
            material.setUnit(MaterialUnit.ADET);
            material.setPurchasePrice(safeGet(parseBigDecimal(m.getPURCHASE_PRICE())));
            material.setSalesPrice(safeGet(parseBigDecimal(m.getSALES_PRICE())));
            materialRepository.save(material);

            existingMaterials.add(code);
        }
    }

    private void processPrices(Object priceList, boolean isPurchase) {
        List<PriceRecordXml> records;

        if (priceList instanceof PurchasePriceXmlList pList) {
            records = pList.getRecords();
        } else if (priceList instanceof SalesPriceXmlList sList) {
            records = sList.getRecords();
        } else {
            return;
        }
        for(PriceRecordXml r : records) {
            String code = Objects.requireNonNullElse(r.getCode().trim().toUpperCase(), "");
            materialRepository.findByCode(code).ifPresent(
                    material -> {
                        BigDecimal price = safeGet(parseBigDecimal(r.getPrice()));
                        if(isPurchase) {
                            material.setPurchasePrice(price);
                            material.setPurchaseCurrency(Currency.EUR);
                        }
                        else {
                            material.setSalesPrice(price);
                            material.setSalesCurrency(Currency.EUR);
                        }
                        materialRepository.save(material);
                    }
            );
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(value.replace(",", "."));
    }

    private void saveMaterialPrice(Material material, LocalDate date, String customerName, BigDecimal price, BigDecimal quantity, InvoiceType invoiceType, Customer customer, Long invoiceId) {
        MaterialPriceHistory materialPriceHistory = new MaterialPriceHistory();

        materialPriceHistory.setMaterial(material);
        materialPriceHistory.setPrice(safeGet(price));
        materialPriceHistory.setInvoiceType(Objects.requireNonNullElse(invoiceType, InvoiceType.UNKNOWN));
        materialPriceHistory.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        materialPriceHistory.setCustomerName(Objects.requireNonNullElse(customerName, ""));
        materialPriceHistory.setQuantity(safeGet(quantity));
        materialPriceHistory.setCustomer(customer);
        materialPriceHistory.setInvoiceId(Objects.requireNonNullElse(invoiceId, 999L));
        materialPriceHistoryRepository.save(materialPriceHistory);
    }

    private Company getCompany(String schemaName) {
        return companyRepository.findBySchemaName(schemaName);
    }

    private OpeningVoucher getDefaultVoucher(Company company, Customer newCustomer, LocalDate date) {
        OpeningVoucher voucher = new OpeningVoucher();
        voucher.setCompany(company);
        voucher.setDate(Objects.requireNonNullElse(date, LocalDate.now()));
        voucher.setCustomer(newCustomer);
        voucher.setCustomerName(Objects.requireNonNullElse(newCustomer.getName(), ""));
        voucher.setDebit(BigDecimal.ZERO);
        voucher.setCredit(BigDecimal.ZERO);
        voucher.setYearlyDebit(BigDecimal.ZERO);
        voucher.setYearlyCredit(BigDecimal.ZERO);
        voucher.setFinalBalance(BigDecimal.ZERO);
        voucher.setFileNo("001");
        voucher.setDescription("Xml İmport Bilgisi");
        return openingBalanceRepository.save(voucher);
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

}
