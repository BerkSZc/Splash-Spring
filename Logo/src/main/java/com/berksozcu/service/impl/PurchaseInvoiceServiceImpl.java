package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.Material;
import com.berksozcu.entites.PurchaseInvoice;
import com.berksozcu.entites.PurchaseInvoiceItem;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.IPurchaseInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PurchaseInvoiceServiceImpl implements IPurchaseInvoiceService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;


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
                BigDecimal kdvTutarHesaplama= item.getKdv().divide(BigDecimal.valueOf(100))
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

        return newPurchaseInvoice;
    }
}
