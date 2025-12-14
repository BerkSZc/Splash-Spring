package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.entites.purchase.PurchaseInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialPriceHistoryRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.IPurchaseInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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


    @Override
    @Transactional
    public PurchaseInvoice addPurchaseInvoice(Long id, PurchaseInvoice newPurchaseInvoice) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        newPurchaseInvoice.setCustomer(customer);

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;
        if (newPurchaseInvoice.getItems() != null) {
            for (PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {

                Material material = materialRepository
                        .findById(item.getMaterial().getId())
                        .orElseThrow(() -> new RuntimeException("Material not found"));

                item.setMaterial(material);
                item.setPurchaseInvoice(newPurchaseInvoice);

                //KDV HESAPLAMA
                BigDecimal kdv = item.getKdv().add(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(100));


                // TOPLAM KDV Yİ TOPLAM ÜCRET E EKLEME
                BigDecimal lineTotal = item.getUnitPrice().multiply(kdv)
                        .multiply(item.getQuantity());


                //  TOPLAM KDV HESAPLAMA
                BigDecimal kdvTutarHesaplama = item.getKdv().divide(BigDecimal.valueOf(100))
                        .multiply(item.getUnitPrice()).multiply(item.getQuantity());

                item.setKdvTutar(kdvTutarHesaplama);

                item.setLineTotal(lineTotal);

                kdvToplam = kdvToplam.add(kdvTutarHesaplama);
                totalPrice = totalPrice.add(lineTotal);
            }
        }

        newPurchaseInvoice.setKdvToplam(kdvToplam);

        newPurchaseInvoice.setTotalPrice(totalPrice);

        // Müşteri bakiyesini güncelle
        customer.setBalance(customer.getBalance().add(totalPrice));

        // Cascade ALL olduğundan invoice save = items save
        purchaseInvoiceRepository.save(newPurchaseInvoice);
        customerRepository.save(customer);

        for(PurchaseInvoiceItem item : newPurchaseInvoice.getItems()) {
            MaterialPriceHistory history = new MaterialPriceHistory();
            history.setInvoiceType(InvoiceType.PURCHASE);
            history.setMaterial(item.getMaterial());
            history.setPrice(item.getUnitPrice());
            history.setDate(newPurchaseInvoice.getDate());
            history.setCustomerName(customer.getName());
            history.setQuantity(item.getQuantity());

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

        Customer customer = oldInvoice.getCustomer();
        customer.setBalance(customer.getBalance().subtract(oldInvoice.getTotalPrice()));

        oldInvoice.setDate(newPurchaseInvoice.getDate());
        oldInvoice.setFileNo(newPurchaseInvoice.getFileNo());


        List<PurchaseInvoiceItem> oldItems = oldInvoice.getItems();
        List<PurchaseInvoiceItem> newItems = newPurchaseInvoice.getItems();

        oldItems.removeIf(old ->
                newItems.stream().noneMatch(n ->
                      n.getId() != null  && n.getId().equals(old.getId())));


        for (PurchaseInvoiceItem newItem : newItems) {
           Material material = materialRepository.findById(newItem.getMaterial().getId())
                   .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

                if(newItem.getId() == null) {
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

            BigDecimal kdvTutar = unitPrice.multiply(qty).multiply(kdvOran);
            BigDecimal lineTotal = unitPrice.multiply(qty).add(kdvTutar);

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar);
            total = total.add(lineTotal);
        }
        oldInvoice.setTotalPrice(total);
        oldInvoice.setKdvToplam(kdvToplam);

        customer.setBalance(customer.getBalance().add(total));
        customerRepository.save(customer);

        return purchaseInvoiceRepository.save(oldInvoice);
    }

    @Override
    @Transactional
    public void deletePurchaseInvoice(Long id) {
        PurchaseInvoice purchaseInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer customer = purchaseInvoice.getCustomer();

        customer.setBalance(customer.getBalance().subtract(purchaseInvoice.getTotalPrice()));
        customerRepository.save(customer);

        purchaseInvoiceRepository.deleteById(id);
    }

}
