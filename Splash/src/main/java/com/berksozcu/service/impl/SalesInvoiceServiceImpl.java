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
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;


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
    private ICommonDataService currencyRateService;

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
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyDebit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(start);
                    newVoucher.setCustomer(salesInvoice.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(salesInvoice.getTotalPrice());
        }

        salesInvoice.setCustomer(customer);

        BigDecimal usdRate = currencyRateService.getRateOrDefault("USD", salesInvoice.getDate());
        BigDecimal eurRate = currencyRateService.getRateOrDefault("EUR", salesInvoice.getDate());

        salesInvoice.setEurSellingRate(eurRate);
        salesInvoice.setUsdSellingRate(usdRate);
        salesInvoice.setCompany(company);

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (SalesInvoiceItem item : salesInvoice.getItems()) {
            Material material = materialRepository.findById(item.getMaterial().getId()).orElseThrow(() -> new RuntimeException("Material Not Found"));

            item.setMaterial(material);
            item.setSalesInvoice(salesInvoice);


            // Malzemenin bulunduğu satırın kdv siz fiyatı
            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(item.getQuantity())
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal kdv = item.getKdv().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal kdvTutarHesaplama = kdv
                    .multiply(item.getUnitPrice()).multiply(item.getQuantity())
                    .setScale(2, RoundingMode.HALF_UP);


            item.setKdvTutar(kdvTutarHesaplama);
            kdvToplam = kdvToplam.add(kdvTutarHesaplama).setScale(2, RoundingMode.HALF_UP);

            item.setLineTotal(lineTotal);
            totalPrice = totalPrice.add(lineTotal).setScale(2, RoundingMode.HALF_UP);
        }
        totalPrice = totalPrice.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        salesInvoice.setKdvToplam(kdvToplam);
        salesInvoice.setTotalPrice(totalPrice);

        voucher.setFinalBalance(voucher.getFinalBalance().add(totalPrice));
        voucher.setDebit(voucher.getDebit().add(totalPrice));

        openingVoucherRepository.save(voucher);
        salesInvoiceRepository.save(salesInvoice);
        customerRepository.save(customer);

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

        Company company = companyRepository.findBySchemaName(schemaName);

        SalesInvoice oldInvoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        LocalDate start = LocalDate.of(salesInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(salesInvoice.getDate().getYear(), 12, 31);

        if(salesInvoiceRepository.existsByFileNo(salesInvoice.getFileNo())
        && !oldInvoice.getFileNo().equals(salesInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        if(!oldInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomer(salesInvoice.getCustomer());
                    newVoucher.setDate(start);
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyDebit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setFileNo("001");
                    newVoucher.setCustomerName(salesInvoice.getCustomer().getName());
                    return newVoucher;
                });

        Customer customer = oldInvoice.getCustomer();

        BigDecimal finalBalance = voucher.getFinalBalance() != null ? voucher.getFinalBalance() : BigDecimal.ZERO;

        voucher.setFinalBalance(finalBalance.subtract(oldInvoice.getTotalPrice()));
        voucher.setDebit(voucher.getDebit().add(oldInvoice.getTotalPrice()));

        for (SalesInvoiceItem oldItem : oldInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(oldItem.getMaterial().getId(), oldInvoice.getId());
        }

        oldInvoice.setDate(salesInvoice.getDate());
        oldInvoice.setFileNo(salesInvoice.getFileNo());
        oldInvoice.setEurSellingRate(salesInvoice.getEurSellingRate());
        oldInvoice.setUsdSellingRate(salesInvoice.getUsdSellingRate());

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
                oldItem.setQuantity(newItem.getQuantity());
                oldItem.setUnitPrice(newItem.getUnitPrice());
                oldItem.setKdv(newItem.getKdv());
            }
        }

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (SalesInvoiceItem item : oldItems) {
            //KDV HESAPLAMA
            BigDecimal kdvOran = item.getKdv().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            //Malzemenin bulunduğu satırın kdv tutarı
            BigDecimal kdvTutar = item.getUnitPrice().multiply(item.getQuantity()).multiply(kdvOran);
            //Malzemenin bulunduğu satırın Kdv siz fiyatı
            BigDecimal lineTotal = item.getUnitPrice().multiply(item.getQuantity());

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal).setScale(2, RoundingMode.HALF_UP);

            savePriceHistory(item, oldInvoice, salesInvoice.getCustomer());

        }
        total = total.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);


        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        // 5- Yeni toplamı müşterinin bakiyesine ekle
        voucher.setFinalBalance(finalBalance.add(total));
        voucher.setDebit(voucher.getDebit().add(total));
        openingVoucherRepository.save(voucher);
        customerRepository.save(customer);

        return salesInvoiceRepository.save(oldInvoice);

    }

    @Override
    @Transactional
    public void deleteSalesInvoice(Long id, String schemaName) {
        SalesInvoice salesInvoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Company company = companyRepository.findBySchemaName(schemaName);

        if(!salesInvoice.getCompany().getId().equals(company.getId())){
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(salesInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(salesInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(salesInvoice.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(salesInvoice.getTotalPrice());
                    newVoucher.setDate(LocalDate.of(salesInvoice.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(salesInvoice.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(salesInvoice.getTotalPrice());
        }

        Customer customer = salesInvoice.getCustomer();

        for (SalesInvoiceItem salesInvoiceItem : salesInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(salesInvoiceItem.getMaterial().getId(), id);
        }

        voucher.setFinalBalance(voucher.getFinalBalance().subtract(salesInvoice.getTotalPrice()));
        voucher.setDebit(voucher.getDebit().subtract(salesInvoice.getTotalPrice()));
        customerRepository.save(customer);

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
        saveHistory.setInvoiceId(invoice.getId());
        saveHistory.setInvoiceType(InvoiceType.SALES);
        saveHistory.setPrice(item.getUnitPrice());
        saveHistory.setQuantity(item.getQuantity());
        saveHistory.setDate(invoice.getDate());
        saveHistory.setCustomerName(customer.getName());
        saveHistory.setCustomer(customer);
        materialPriceHistoryRepository.save(saveHistory);
    }
}



