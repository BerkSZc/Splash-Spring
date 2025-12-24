package com.berksozcu.service.impl;

import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.material.Material;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.material_price_history.MaterialPriceHistory;
import com.berksozcu.entites.sales.SalesInvoice;
import com.berksozcu.entites.sales.SalesInvoiceItem;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.MaterialPriceHistoryRepository;
import com.berksozcu.repository.MaterialRepository;
import com.berksozcu.repository.SalesInvoiceRepository;
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
    private ModelMapper modelMapper;

    @Autowired
    private MaterialPriceHistoryRepository repository;


    @Override
    @Transactional
    public SalesInvoice addSalesInvoice(Long id, SalesInvoice salesInvoice) {
        Customer customer = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("Customer Not Found"));

        if(customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

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

            BigDecimal kdvTutarHesaplama = item.getKdv().divide(BigDecimal.valueOf(100))
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

        for(SalesInvoiceItem item : salesInvoice.getItems()) {
            MaterialPriceHistory history = new MaterialPriceHistory();
            history.setDate(salesInvoice.getDate());
            history.setInvoiceType(InvoiceType.SALES);
            history.setMaterial(item.getMaterial());
            history.setCustomerName(customer.getName());
            history.setPrice(item.getUnitPrice());
            history.setQuantity(item.getQuantity());
            repository.save(history);
        }




        return salesInvoice;
    }

    @Override
    public List<SalesInvoice> getAllSalesInvoice() {
        return salesInvoiceRepository.findAll();
    }

    @Override
    @Transactional
    public SalesInvoice editSalesInvoice(Long id, SalesInvoice salesInvoice) {

        SalesInvoice oldInvoice = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));


        Customer customer = oldInvoice.getCustomer();

        customer.setBalance(customer.getBalance().subtract(oldInvoice.getTotalPrice()));

        oldInvoice.setDate(salesInvoice.getDate());
        oldInvoice.setFileNo(salesInvoice.getFileNo());

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
            BigDecimal qty = item.getQuantity();
            BigDecimal price = item.getUnitPrice();
            BigDecimal kdvOran = item.getKdv().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal kdvTutar = price.multiply(qty).multiply(kdvOran);
            BigDecimal lineTotal = price.multiply(qty).add(kdvTutar);

            item.setKdvTutar(kdvTutar);
            item.setLineTotal(lineTotal);

            kdvToplam = kdvToplam.add(kdvTutar);
            total = total.add(lineTotal);
        }

        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        // 5- Yeni toplamı müşterinin bakiyesine ekle
        customer.setBalance(customer.getBalance().add(total));

        customerRepository.save(customer);

        return salesInvoiceRepository.save(oldInvoice);

    }

    @Override
    @Transactional
    public void deleteSalesInvoice(Long id) {
        SalesInvoice salesInvoice = salesInvoiceRepository.findById(id)
                        .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer customer = salesInvoice.getCustomer();

        customer.setBalance(customer.getBalance().subtract(salesInvoice.getTotalPrice()));
        customerRepository.save(customer);

        salesInvoiceRepository.deleteById(id);
    }

    @Override
    public List<SalesInvoice> getSalesInvoicesByYear(int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12 , 31);
        return salesInvoiceRepository.findByDateBetween(start, end);
    }
}



