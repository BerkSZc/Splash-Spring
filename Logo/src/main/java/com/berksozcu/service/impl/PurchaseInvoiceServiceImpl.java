package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.ICurrencyRateService;
import com.berksozcu.service.IPurchaseInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

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
    private ICurrencyRateService currencyRateService;

    @Autowired
    private OpeningVoucherRepository openingVoucherRepository;


    @Override
    @Transactional
    public PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));
        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        if (purchaseInvoiceRepository.existsByFileNo(newPurchaseInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        newPurchaseInvoice.setCustomer(customer);

        BigDecimal usdRate = currencyRateService.getRateOrDefault("USD", newPurchaseInvoice.getDate());
        BigDecimal eurRate = currencyRateService.getRateOrDefault("EUR", newPurchaseInvoice.getDate());

        newPurchaseInvoice.setUsdSellingRate(usdRate);
        newPurchaseInvoice.setEurSellingRate(eurRate);

        //Fatura toplam fiyatı
        BigDecimal totalPrice = BigDecimal.ZERO;
        //Kdv Toplam fiyatı
        BigDecimal kdvToplam = BigDecimal.ZERO;

        LocalDate start = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(customer.getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(newPurchaseInvoice.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(newPurchaseInvoice.getTotalPrice());
        }

        if (newPurchaseInvoice.getItems() != null) {
            for (PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {

                Material material = materialRepository
                        .findById(item.getMaterial().getId())
                        .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));


                item.setMaterial(material);
                item.setPurchaseInvoice(newPurchaseInvoice);

                //KDV HESAPLAMA
                BigDecimal kdv = item.getKdv().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);


                //  Malzemenin bulunduğu satırın kdv sini HESAPLAMA
                BigDecimal kdvTutarHesaplama = item.getUnitPrice().multiply(kdv)
                        .multiply(item.getQuantity())
                        .setScale(2, RoundingMode.HALF_UP);

                // Malzemenin bulunduğu satırın kdv siz fiyatı
                BigDecimal lineTotal = item.getUnitPrice()
                        .multiply(item.getQuantity()).setScale(2, RoundingMode.HALF_UP);


                item.setKdvTutar(kdvTutarHesaplama);

                item.setLineTotal(lineTotal);

                kdvToplam = kdvToplam.add(kdvTutarHesaplama).setScale(2, RoundingMode.HALF_UP);
                totalPrice = totalPrice.add(lineTotal).setScale(2, RoundingMode.HALF_UP);
            }
        }

        newPurchaseInvoice.setKdvToplam(kdvToplam);
        totalPrice = totalPrice.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        newPurchaseInvoice.setTotalPrice(totalPrice);

        // Müşteri bakiyesini güncelle
        voucher.setFinalBalance(voucher.getFinalBalance().subtract(totalPrice).setScale(2, RoundingMode.HALF_UP));
        voucher.setCredit(voucher.getCredit().add(totalPrice).setScale(2, RoundingMode.HALF_UP));
        // Cascade ALL olduğundan invoice save = items save
        purchaseInvoiceRepository.save(newPurchaseInvoice);
        openingVoucherRepository.save(voucher);
        customerRepository.save(customer);

        for (PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {
            MaterialPriceHistory history = new MaterialPriceHistory();
            history.setInvoiceType(InvoiceType.PURCHASE);
            history.setMaterial(item.getMaterial());
            history.setPrice(item.getUnitPrice());
            history.setDate(newPurchaseInvoice.getDate());
            history.setCustomerName(customer.getName());
            history.setQuantity(item.getQuantity());
            history.setInvoiceId(newPurchaseInvoice.getId());
            history.setCustomer(newPurchaseInvoice.getCustomer());

            materialPriceHistoryRepository.save(history);

//            Material material = new Material();
//            material.setLastPurchasePrice(item.getUnitPrice());
//            materialRepository.save(material);
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
    public PurchaseInvoice editPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice) {
        PurchaseInvoice oldInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        LocalDate start = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 12, 31);

        if(purchaseInvoiceRepository.existsByFileNo(newPurchaseInvoice.getFileNo())
        && !oldInvoice.getFileNo().equals(newPurchaseInvoice.getFileNo())) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(newPurchaseInvoice.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setYearlyCredit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(BigDecimal.ZERO);
                    newVoucher.setDate(LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(newPurchaseInvoice.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(newPurchaseInvoice.getTotalPrice());
        }
        BigDecimal finalBalance = voucher.getFinalBalance() != null ? voucher.getFinalBalance() : BigDecimal.ZERO;

        Customer customer = oldInvoice.getCustomer();
        voucher.setFinalBalance(finalBalance.add(oldInvoice.getTotalPrice()));
        voucher.setCredit(voucher.getCredit().add(oldInvoice.getTotalPrice()));


        oldInvoice.setDate(newPurchaseInvoice.getDate());
        oldInvoice.setFileNo(newPurchaseInvoice.getFileNo());
        oldInvoice.setEurSellingRate(newPurchaseInvoice.getEurSellingRate());
        oldInvoice.setUsdSellingRate(newPurchaseInvoice.getUsdSellingRate());

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
                oldItem.setQuantity(newItem.getQuantity());
                oldItem.setUnitPrice(newItem.getUnitPrice());
                oldItem.setKdv(newItem.getKdv());
            }

        }

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (PurchaseInvoiceItem item : oldItems) {
            BigDecimal qty = item.getQuantity();
            BigDecimal unitPrice = item.getUnitPrice();
            BigDecimal kdvOran = item.getKdv().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal kdvTutar = unitPrice.multiply(qty).multiply(kdvOran).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP);

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal).setScale(2, RoundingMode.HALF_UP);

            MaterialPriceHistory history = new MaterialPriceHistory();
            history.setMaterial(item.getMaterial());
            history.setInvoiceId(newPurchaseInvoice.getId());
            history.setInvoiceType(InvoiceType.PURCHASE);
            history.setPrice(item.getUnitPrice());
            history.setQuantity(item.getQuantity());
            history.setDate(oldInvoice.getDate());
            history.setCustomerName(customer.getName());
            history.setCustomer(newPurchaseInvoice.getCustomer());
            materialPriceHistoryRepository.save(history);
        }
        total = total.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        voucher.setFinalBalance(finalBalance.subtract(total));
        voucher.setCredit(voucher.getCredit().subtract(total));
        customerRepository.save(customer);

        return purchaseInvoiceRepository.save(oldInvoice);
    }

    @Override
    @Transactional
    public void deletePurchaseInvoice(Long id) {
        PurchaseInvoice purchaseInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        LocalDate start = LocalDate.of(purchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(purchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndDateBetween(id, start, end)
                .orElseGet(() -> {
                    OpeningVoucher newVoucher = new OpeningVoucher();
                    newVoucher.setCustomerName(purchaseInvoice.getCustomer().getName());
                    newVoucher.setDescription("Eklendi");
                    newVoucher.setFileNo("001");
                    newVoucher.setDebit(BigDecimal.ZERO);
                    newVoucher.setCredit(BigDecimal.ZERO);
                    newVoucher.setFinalBalance(purchaseInvoice.getTotalPrice());
                    newVoucher.setDate(LocalDate.of(purchaseInvoice.getDate().getYear(), 1, 1));
                    newVoucher.setCustomer(purchaseInvoice.getCustomer());
                    return newVoucher;
                });
        if (voucher.getFinalBalance() == null) {
            voucher.setFinalBalance(purchaseInvoice.getTotalPrice());
        }

        for (PurchaseInvoiceItem item : purchaseInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceId(item.getMaterial().getId(), id);
        }

        Customer customer = purchaseInvoice.getCustomer();

        voucher.setFinalBalance(voucher.getFinalBalance().add(purchaseInvoice.getTotalPrice()));
        voucher.setCredit(voucher.getCredit().add(purchaseInvoice.getTotalPrice()));
        customerRepository.save(customer);

        purchaseInvoiceRepository.deleteById(id);
    }

    @Override
    public List<PurchaseInvoice> getPurchaseInvoiceByDateBetween(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return purchaseInvoiceRepository.findByDateBetween(start, end);
    }
}
