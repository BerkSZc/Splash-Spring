package com.berksozcu.service.impl;

import com.berksozcu.entites.Customer;
import com.berksozcu.entites.Material;
import com.berksozcu.entites.SalesInvoice;
import com.berksozcu.entites.SalesInvoiceItem;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.SalesInvoiceRepository;
import com.berksozcu.service.ISalesInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class SalesInvoiceServiceImpl implements ISalesInvoiceService {

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CustomerRepository customerRepository;


    @Override
    @Transactional
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer Not Found"));

        salesInvoice.setCustomer(customer);

        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal kdvToplam = BigDecimal.ZERO;

        for (SalesInvoiceItem item : salesInvoice.getItems()) {
            Material material = materialRepository.findById(item.getMaterial().getId()).orElseThrow(() -> new RuntimeException("Material Not Found"));

            item.setMaterial(material);
            item.setSalesInvoice(salesInvoice);

            //KDV HESAPLAMA
            BigDecimal kdv = item.getKdv().add(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(100));

            BigDecimal lineTotal = item.getUnitPrice().multiply(kdv)
                    .multiply(item.getQuantity());

            BigDecimal kdvTutarHesaplama= item.getKdv().divide(BigDecimal.valueOf(100))
                    .multiply(item.getUnitPrice()).multiply(item.getQuantity());


            item.setKdvTutar(kdvTutarHesaplama);
            kdvToplam = kdvToplam.add(kdvTutarHesaplama);

            item.setLineTotal(lineTotal);
            totalPrice = totalPrice.add(lineTotal);
        }
        salesInvoice.setKdvToplam(kdvToplam);
        salesInvoice.setTotalPrice(totalPrice);

        customer.setBalance(customer.getBalance().add(totalPrice));

        salesInvoiceRepository.save(salesInvoice);
        customerRepository.save(customer);

        return salesInvoice;
    }
}
