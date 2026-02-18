package com.berksozcu.service.impl;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.ICommonDataService;
import com.berksozcu.service.ISalesInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;


@Service
public class SalesInvoiceServiceImpl implements ISalesInvoiceService {

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    @Transactional
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice, String schemaName) {
        Customer customer = customerRepository.findById(id).orElseThrow(
                () -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if (salesInvoiceRepository.existsByFileNo(salesInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        LocalDate start = LocalDate.of(salesInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(salesInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, start, company));

        salesInvoice.setCustomer(customer);

        salesInvoice.setEurSellingRate(safeGet(salesInvoice.getEurSellingRate()));
        salesInvoice.setUsdSellingRate(safeGet(salesInvoice.getUsdSellingRate()));
        salesInvoice.setCompany(company);
        salesInvoice.setFileNo(Objects.requireNonNullElse(salesInvoice.getFileNo(), "").toUpperCase());

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (SalesInvoiceItem item : salesInvoice.getItems()) {
            Material material = materialRepository.findById(item.getMaterial().getId()).orElseThrow(
                    () -> new BaseException(new ErrorMessage(MessageType.MALZEME_ALAN_BOS)));

            item.setMaterial(material);
            item.setSalesInvoice(salesInvoice);

            // Malzemenin bulunduğu satırın kdv siz fiyatı
            BigDecimal lineTotal = safeGet(item.getUnitPrice())
                    .multiply(safeGet(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal kdv = safeGet(item.getKdv()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal kdvTutarHesaplama = kdv
                    .multiply(safeGet(item.getUnitPrice())).multiply(safeGet(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            item.setKdvTutar(kdvTutarHesaplama);
            item.setQuantity(safeGet(item.getQuantity()));
            item.setUnitPrice(safeGet(item.getUnitPrice()));
            item.setKdv(safeGet(item.getKdv()));

            kdvToplam = kdvToplam.add(kdvTutarHesaplama).setScale(2, RoundingMode.HALF_UP);

            item.setLineTotal(lineTotal);
            totalPrice = totalPrice.add(lineTotal).setScale(2, RoundingMode.HALF_UP);
        }
        totalPrice = totalPrice.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        salesInvoice.setKdvToplam(kdvToplam);
        salesInvoice.setTotalPrice(totalPrice);

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(totalPrice));
        voucher.setDebit(safeGet(voucher.getDebit()).add(totalPrice));

        openingVoucherRepository.save(voucher);
        salesInvoiceRepository.save(salesInvoice);

        for (SalesInvoiceItem item : salesInvoice.getItems()) {
            savePriceHistory(item, salesInvoice, customer);
        }
        return salesInvoice;
    }

    @Override
    public List<SalesInvoice> getAllSalesInvoice() {
        return salesInvoiceRepository.findAll();
    }

    @Override
    @Transactional
    public SalesInvoice editSalesInvoice(Long id, SalesInvoice salesInvoice, String schemaName) {

        LocalDate start = LocalDate.of(salesInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(salesInvoice.getDate().getYear(), 12, 31);

        Company company = companyRepository.findBySchemaName(schemaName);

        SalesInvoice oldInvoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        if (salesInvoiceRepository.existsByFileNo(salesInvoice.getFileNo())
                && !oldInvoice.getFileNo().equals(salesInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        if (!oldInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        Customer oldCustomer = oldInvoice.getCustomer();
        Customer newCustomer = salesInvoice.getCustomer();

        OpeningVoucher oldVoucher =
                openingVoucherRepository.findByCustomerIdAndDateBetween(oldCustomer.getId(), start, end)
                        .orElseGet(() -> getDefaultVoucher(newCustomer, start, company));

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).subtract(safeGet(oldInvoice.getTotalPrice())));
        oldVoucher.setDebit(safeGet(oldVoucher.getDebit()).subtract(safeGet(oldInvoice.getTotalPrice())));

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndDateBetween(newCustomer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, start, company));

        for (SalesInvoiceItem oldItem : oldInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(oldItem.getMaterial().getId(), oldInvoice.getId());
        }

        oldInvoice.setDate(Objects.requireNonNullElse(salesInvoice.getDate(), LocalDate.now()));
        oldInvoice.setFileNo(Objects.requireNonNullElse(salesInvoice.getFileNo(), "").toUpperCase());
        oldInvoice.setEurSellingRate(safeGet(salesInvoice.getEurSellingRate()));
        oldInvoice.setUsdSellingRate(safeGet(salesInvoice.getUsdSellingRate()));
        oldInvoice.setCustomer(newCustomer);

        List<SalesInvoiceItem> oldItems = oldInvoice.getItems();
        List<SalesInvoiceItem> newItems = salesInvoice.getItems();

        oldItems.removeIf(old ->
                newItems.stream().noneMatch(n -> n.getId() != null
                        && n.getId().equals(old.getId())));

        for (SalesInvoiceItem newItem : newItems) {
            Material material = materialRepository.findById(newItem.getMaterial().getId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

            if (newItem.getId() == null) {
                newItem.setMaterial(material);
                newItem.setSalesInvoice(oldInvoice);
                oldItems.add(newItem);
            } else {
                SalesInvoiceItem oldItem = oldItems.stream()
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

        for (SalesInvoiceItem item : oldItems) {
            //KDV HESAPLAMA
            BigDecimal kdvOran = safeGet(item.getKdv()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            //Malzemenin bulunduğu satırın kdv tutarı
            BigDecimal kdvTutar = safeGet(item.getUnitPrice()).multiply(safeGet(item.getQuantity())).multiply(kdvOran);
            //Malzemenin bulunduğu satırın Kdv siz fiyatı
            BigDecimal lineTotal = safeGet(item.getUnitPrice()).multiply(safeGet(item.getQuantity()));

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal).setScale(2, RoundingMode.HALF_UP);

            savePriceHistory(item, salesInvoice, newCustomer);
        }
        total = total.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        // 5- Yeni toplamı müşterinin bakiyesine ekle
        newVoucher.setFinalBalance(safeGet(newVoucher.getFinalBalance()).add(total));
        newVoucher.setDebit(safeGet(newVoucher.getDebit()).add(total));

        openingVoucherRepository.save(newVoucher);
        openingVoucherRepository.save(oldVoucher);
        return salesInvoiceRepository.save(oldInvoice);
    }

    @Override
    @Transactional
    public void deleteSalesInvoice(Long id, String schemaName) {
        SalesInvoice salesInvoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);

        if (!salesInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }
        Customer customer = salesInvoice.getCustomer();

        LocalDate start = LocalDate.of(salesInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(salesInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(customer.getId(), start, end)
                .orElseGet(() -> getDefaultVoucher(customer, start, company));

        for (SalesInvoiceItem salesInvoiceItem : salesInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(salesInvoiceItem.getMaterial().getId(), id);
        }

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(safeGet(salesInvoice.getTotalPrice())));
        voucher.setDebit(safeGet(voucher.getDebit()).subtract(safeGet(salesInvoice.getTotalPrice())));

        openingVoucherRepository.save(voucher);
        salesInvoiceRepository.deleteById(id);
    }

    @Override
    public List<SalesInvoice> getSalesInvoicesByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return salesInvoiceRepository.findByDateBetween(start, end);
    }

    private void savePriceHistory(SalesInvoiceItem item, SalesInvoice invoice, Customer customer) {
        MaterialPriceHistory saveHistory = new MaterialPriceHistory();
        saveHistory.setMaterial(item.getMaterial());
        saveHistory.setInvoiceId(Objects.requireNonNullElse(invoice.getId(), 999L));
        saveHistory.setInvoiceType(InvoiceType.SALES);
        saveHistory.setPrice(safeGet(item.getUnitPrice()));
        saveHistory.setQuantity(safeGet(item.getQuantity()));
        saveHistory.setDate(Objects.requireNonNullElse(invoice.getDate(), LocalDate.now()));
        saveHistory.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        saveHistory.setCustomer(customer);
        materialPriceHistoryRepository.save(saveHistory);
    }

    private OpeningVoucher getDefaultVoucher(Customer customer, LocalDate start, Company company) {
        OpeningVoucher newVoucher = new OpeningVoucher();
        newVoucher.setCustomer(customer);
        newVoucher.setDate(Objects.requireNonNullElse(start,  LocalDate.now()));
        newVoucher.setDebit(BigDecimal.ZERO);
        newVoucher.setCredit(BigDecimal.ZERO);
        newVoucher.setYearlyCredit(BigDecimal.ZERO);
        newVoucher.setYearlyDebit(BigDecimal.ZERO);
        newVoucher.setFinalBalance(BigDecimal.ZERO);
        newVoucher.setFileNo("001");
        newVoucher.setDescription("Eklendi");
        newVoucher.setCompany(company);
        newVoucher.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        return newVoucher;
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value !=  null ? value : BigDecimal.ZERO;
    }
}



