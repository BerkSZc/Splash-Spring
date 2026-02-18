package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.ICommonDataService;
import com.berksozcu.service.IPurchaseInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class PurchaseInvoiceServiceImpl implements IPurchaseInvoiceService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;


    @Override
    @Transactional
    public PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if (purchaseInvoiceRepository.existsByFileNo(newPurchaseInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        Company company = companyRepository.findBySchemaName(schemaName);

        newPurchaseInvoice.setCompany(company);
        newPurchaseInvoice.setCustomer(customer);

        newPurchaseInvoice.setUsdSellingRate(safeGet(newPurchaseInvoice.getUsdSellingRate()));
        newPurchaseInvoice.setEurSellingRate(safeGet(newPurchaseInvoice.getEurSellingRate()));
        newPurchaseInvoice.setDate(Objects.requireNonNullElse(newPurchaseInvoice.getDate(), LocalDate.now()));
        newPurchaseInvoice.setFileNo(Objects.requireNonNullElse(newPurchaseInvoice.getFileNo(), "").toUpperCase());

        //Fatura toplam fiyatı
        BigDecimal totalPrice = BigDecimal.ZERO;
        //Kdv Toplam fiyatı
        BigDecimal kdvToplam = BigDecimal.ZERO;

        LocalDate start = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        if (newPurchaseInvoice.getItems() != null) {
            for (PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {

                Material material = materialRepository
                        .findById(item.getMaterial().getId())
                        .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

                item.setMaterial(material);
                item.setPurchaseInvoice(newPurchaseInvoice);

                //KDV HESAPLAMA
                BigDecimal kdv = safeGet(item.getKdv()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

                //  Malzemenin bulunduğu satırın kdv sini HESAPLAMA
                BigDecimal kdvTutarHesaplama = safeGet(item.getUnitPrice()).multiply(kdv)
                        .multiply(safeGet(item.getQuantity()))
                        .setScale(2, RoundingMode.HALF_UP);

                // Malzemenin bulunduğu satırın kdv siz fiyatı
                BigDecimal lineTotal = safeGet(item.getUnitPrice())
                        .multiply(safeGet(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);

                item.setKdvTutar(kdvTutarHesaplama);
                item.setLineTotal(lineTotal);

                item.setQuantity(safeGet(item.getQuantity()));
                item.setUnitPrice(safeGet(item.getUnitPrice()));
                item.setKdv(safeGet(item.getKdv()));

                kdvToplam = kdvToplam.add(kdvTutarHesaplama).setScale(2, RoundingMode.HALF_UP);
                totalPrice = totalPrice.add(lineTotal).setScale(2, RoundingMode.HALF_UP);
            }
        }

        newPurchaseInvoice.setKdvToplam(kdvToplam);
        totalPrice = totalPrice.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        newPurchaseInvoice.setTotalPrice(totalPrice);

        // Müşteri bakiyesini güncelle
        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(totalPrice).setScale(2, RoundingMode.HALF_UP));
        voucher.setCredit(safeGet(voucher.getCredit()).add(totalPrice).setScale(2, RoundingMode.HALF_UP));

        purchaseInvoiceRepository.save(newPurchaseInvoice);
        openingVoucherRepository.save(voucher);

        for (PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {
           saveHistoryPrice(item, newPurchaseInvoice, customer);
        }

        return newPurchaseInvoice;
    }

    @Override
    public List<PurchaseInvoice> findAllPurchaseInvoiceByCustomerId(Long id) {
        List<PurchaseInvoice> invoices = purchaseInvoiceRepository.findAllByCustomerId(id);

        if (invoices.isEmpty()) {
            throw new RuntimeException("Fatura bulunamadı");
        }

        return invoices;
    }

    @Override
    public List<PurchaseInvoice> getAllPurchaseInvoice() {
        return purchaseInvoiceRepository.findAll();
    }

    @Override
    @Transactional
    public PurchaseInvoice editPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice, String schemaName) {

        Company company = companyRepository.findBySchemaName(schemaName);

        PurchaseInvoice oldInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer oldCustomer = oldInvoice.getCustomer();

        Customer newCustomer = newPurchaseInvoice.getCustomer();

        if (!oldInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 12, 31);

        if (purchaseInvoiceRepository.existsByFileNo(newPurchaseInvoice.getFileNo())
                && !oldInvoice.getFileNo().equals(newPurchaseInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(oldCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldInvoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP)));
        oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldInvoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP)));

        oldInvoice.setDate(Objects.requireNonNullElse(newPurchaseInvoice.getDate(), LocalDate.now()));
        oldInvoice.setFileNo(Objects.requireNonNullElse(newPurchaseInvoice.getFileNo(), "").toUpperCase());
        oldInvoice.setEurSellingRate(safeGet(newPurchaseInvoice.getEurSellingRate()));
        oldInvoice.setUsdSellingRate(safeGet(newPurchaseInvoice.getUsdSellingRate()));
        oldInvoice.setCustomer(newCustomer);
        oldInvoice.setCompany(company);

        for (PurchaseInvoiceItem item : oldInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(item.getMaterial().getId(), oldInvoice.getId());
        }

        List<PurchaseInvoiceItem> oldItems = oldInvoice.getItems();
        List<PurchaseInvoiceItem> newItems = newPurchaseInvoice.getItems();

        oldItems.removeIf(old ->
                newItems.stream().noneMatch(n ->
                        n.getId() != null && n.getId().equals(old.getId())));


        for (PurchaseInvoiceItem newItem : newItems) {
            Material material = materialRepository.findById(newItem.getMaterial().getId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

            if (newItem.getId() == null) {
                newItem.setMaterial(material);
                newItem.setPurchaseInvoice(oldInvoice);
                oldItems.add(newItem);
            } else {
                PurchaseInvoiceItem oldItem = oldItems.stream()
                        .filter(i -> i.getId().equals(newItem.getId()))
                        .findFirst()
                        .orElseThrow();

                oldItem.setMaterial(material);
                oldItem.setQuantity(safeGet(newItem.getQuantity()));
                oldItem.setUnitPrice(safeGet(newItem.getUnitPrice()));
                oldItem.setKdv(safeGet(newItem.getKdv()));
            }

        }

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (PurchaseInvoiceItem item : oldItems) {
            BigDecimal qty = safeGet(item.getQuantity());
            BigDecimal unitPrice = safeGet(item.getUnitPrice());
            BigDecimal kdvOran = safeGet(item.getKdv()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal kdvTutar = unitPrice.multiply(qty).multiply(kdvOran).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal).setScale(2, RoundingMode.HALF_UP);

            saveHistoryPrice(item, newPurchaseInvoice, newCustomer);
        }
        total = total.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        newVoucher.setFinalBalance(safeGet(newVoucher.getFinalBalance()).subtract(total));
        newVoucher.setCredit(safeGet(newVoucher.getCredit()).add(total));

        openingVoucherRepository.save(newVoucher);
        openingVoucherRepository.save(oldVoucher);
        return purchaseInvoiceRepository.save(oldInvoice);
    }

    @Override
    @Transactional
    public void deletePurchaseInvoice(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        PurchaseInvoice purchaseInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer customer = purchaseInvoice.getCustomer();

        if (!purchaseInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(purchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(purchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        for (PurchaseInvoiceItem item : purchaseInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(item.getMaterial().getId(), id);
        }

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(purchaseInvoice.getTotalPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).subtract(safeGet(purchaseInvoice.getTotalPrice())));

        openingVoucherRepository.save(voucher);
        purchaseInvoiceRepository.deleteById(id);
    }

    @Override
    public List<PurchaseInvoice> getPurchaseInvoiceByDateBetween(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return purchaseInvoiceRepository.findByDateBetween(start, end);
    }

    private void saveHistoryPrice(PurchaseInvoiceItem item, PurchaseInvoice invoice, Customer customer) {
        MaterialPriceHistory materialPriceHistory = new MaterialPriceHistory();
        materialPriceHistory.setMaterial(item.getMaterial());
        materialPriceHistory.setPrice(safeGet(item.getUnitPrice()));
        materialPriceHistory.setInvoiceId(Objects.requireNonNullElse(invoice.getId(), 999L));
        materialPriceHistory.setDate(Objects.requireNonNullElse(invoice.getDate(), LocalDate.now()));
        materialPriceHistory.setInvoiceType(InvoiceType.PURCHASE);
        materialPriceHistory.setQuantity(safeGet(item.getQuantity()));
        materialPriceHistory.setCustomer(customer);
        materialPriceHistory.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        materialPriceHistoryRepository.save(materialPriceHistory);
    }

    private OpeningVoucher getDefaultVoucher(Customer customer, Company company, LocalDate start) {
        OpeningVoucher newVoucher = new OpeningVoucher();
        newVoucher.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        newVoucher.setDescription("Eklendi");
        newVoucher.setFileNo("001");
        newVoucher.setDebit(BigDecimal.ZERO);
        newVoucher.setCredit(BigDecimal.ZERO);
        newVoucher.setFinalBalance(BigDecimal.ZERO);
        newVoucher.setYearlyDebit(BigDecimal.ZERO);
        newVoucher.setYearlyCredit(BigDecimal.ZERO);
        newVoucher.setCompany(company);
        newVoucher.setDate(Objects.requireNonNullElse(start,  LocalDate.now()));
        newVoucher.setCustomer(customer);
        return newVoucher;
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
