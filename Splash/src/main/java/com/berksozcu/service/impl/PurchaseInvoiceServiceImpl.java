package com.berksozcu.service.impl;

import com.berksozcu.dto.invoice.InvoiceDto;
import com.berksozcu.dto.invoice.InvoiceItemDto;
import com.berksozcu.entites.company.Company;
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
import com.berksozcu.service.ICommonDataService;
import com.berksozcu.service.IPurchaseInvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
    public InvoiceDto addPurchaseInvoice(Long id, InvoiceDto invoiceDto, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        Customer customer = customerRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        if (customer.isArchived()) {
            throw new BaseException(new ErrorMessage(MessageType.ARSIV_MUSTERI));
        }

        String fileNo = invoiceDto.getFileNo() != null ? invoiceDto.getFileNo().trim().toUpperCase() : "";

        if (purchaseInvoiceRepository.existsByFileNoAndCompany(fileNo, company)) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        PurchaseInvoice newPurchaseInvoice = new PurchaseInvoice();

        newPurchaseInvoice.setCompany(company);
        newPurchaseInvoice.setCustomer(customer);

        newPurchaseInvoice.setUsdSellingRate(safeGet(invoiceDto.getUsdSellingRate()));
        newPurchaseInvoice.setEurSellingRate(safeGet(invoiceDto.getEurSellingRate()));
        newPurchaseInvoice.setDate(Objects.requireNonNullElse(invoiceDto.getDate(), LocalDate.now()));
        newPurchaseInvoice.setFileNo(fileNo);
        newPurchaseInvoice.setInvoiced(invoiceDto.isInvoiced());

        //Fatura toplam fiyatı
        BigDecimal totalPrice = BigDecimal.ZERO;
        //Kdv Toplam fiyatı
        BigDecimal kdvToplam = BigDecimal.ZERO;

        List<PurchaseInvoiceItem> entityItems = new ArrayList<>();

        if (invoiceDto.getItems() != null && !invoiceDto.getItems().isEmpty()) {
            for (InvoiceItemDto itemDto : invoiceDto.getItems()) {

                Material material = materialRepository
                        .findByIdAndCompany(itemDto.getMaterialId(), company)
                        .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

                PurchaseInvoiceItem item = new PurchaseInvoiceItem();

                item.setCompany(company);
                item.setPurchaseInvoice(newPurchaseInvoice);
                item.setMaterial(material);
                item.setQuantity(safeGet(itemDto.getQuantity()));
                item.setUnitPrice(safeGet(itemDto.getUnitPrice()));
                item.setKdv(safeGet(itemDto.getKdv()));
                item.setUnit(Objects.requireNonNullElse(itemDto.getUnit(), material.getUnit()));

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

                entityItems.add(item);

                kdvToplam = kdvToplam.add(kdvTutarHesaplama).setScale(2, RoundingMode.HALF_UP);
                totalPrice = totalPrice.add(lineTotal).setScale(2, RoundingMode.HALF_UP);
            }
        }

        newPurchaseInvoice.setItems(entityItems);
        newPurchaseInvoice.setKdvToplam(kdvToplam);

        totalPrice = totalPrice.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);
        newPurchaseInvoice.setTotalPrice(totalPrice);

        LocalDate start = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(newPurchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(id, company, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        // Müşteri bakiyesini güncelle
        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).subtract(totalPrice).setScale(2, RoundingMode.HALF_UP));
        voucher.setCredit(safeGet(voucher.getCredit()).add(totalPrice).setScale(2, RoundingMode.HALF_UP));

        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(newPurchaseInvoice);
        openingVoucherRepository.save(voucher);

        for (PurchaseInvoiceItem item : savedInvoice.getItems()) {
            saveHistoryPrice(item, savedInvoice, customer, company);
        }

        return convertToDto(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceDto editPurchaseInvoice(Long id, InvoiceDto invoiceDto, String schemaName) {

        Company company = companyRepository.findBySchemaName(schemaName);

        PurchaseInvoice oldInvoice = purchaseInvoiceRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer oldCustomer = oldInvoice.getCustomer();

        Customer newCustomer = customerRepository
                .findByIdAndCompany(invoiceDto.getCustomerId(), company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MUSTERI_BULUNAMADI)));

        if (!oldInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        String fileNo = invoiceDto.getFileNo() != null ? invoiceDto.getFileNo().trim().toUpperCase() : "";

        LocalDate oldStart = LocalDate.of(oldInvoice.getDate().getYear(), 1, 1);
        LocalDate oldEnd = LocalDate.of(oldInvoice.getDate().getYear(), 12, 31);

        if (purchaseInvoiceRepository.existsByFileNoAndCompany(fileNo, company)
                && !oldInvoice.getFileNo().equals(fileNo)) {
            throw new BaseException(new ErrorMessage(MessageType.FATURA_NO_MEVCUT));
        }

        OpeningVoucher oldVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        oldCustomer.getId(), company, oldStart, oldEnd)
                .orElseGet(() -> getDefaultVoucher(oldCustomer, company, oldStart));

        oldVoucher.setFinalBalance(safeGet(oldVoucher.getFinalBalance()).add(safeGet(oldInvoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP)));
        oldVoucher.setCredit(safeGet(oldVoucher.getCredit()).subtract(safeGet(oldInvoice.getTotalPrice()).setScale(2, RoundingMode.HALF_UP)));

        for (PurchaseInvoiceItem item : oldInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceIdAndCompany(
                    item.getMaterial().getId(), oldInvoice.getId(), company);
        }

        oldInvoice.setDate(Objects.requireNonNullElse(invoiceDto.getDate(), LocalDate.now()));
        oldInvoice.setFileNo(fileNo);
        oldInvoice.setEurSellingRate(safeGet(invoiceDto.getEurSellingRate()));
        oldInvoice.setUsdSellingRate(safeGet(invoiceDto.getUsdSellingRate()));
        oldInvoice.setCustomer(newCustomer);
        oldInvoice.setCompany(company);
        oldInvoice.setInvoiced(invoiceDto.isInvoiced());

        List<PurchaseInvoiceItem> oldItems = oldInvoice.getItems();
        List<InvoiceItemDto> newItems = invoiceDto.getItems() != null ? invoiceDto.getItems() : new ArrayList<>();

        oldItems.removeIf(old ->
                newItems.stream().noneMatch(n ->
                        n.getId() != null && n.getId().equals(old.getId())));


        for (InvoiceItemDto newItemDto : newItems) {
            Material material = materialRepository.findByIdAndCompany(newItemDto.getMaterialId(), company)
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.MALZEME_BULUNAMADI)));

            if (newItemDto.getId() == null) {
                PurchaseInvoiceItem newItem = new PurchaseInvoiceItem();
                newItem.setCompany(company);
                newItem.setPurchaseInvoice(oldInvoice);
                newItem.setMaterial(material);
                newItem.setQuantity(safeGet(newItemDto.getQuantity()));
                newItem.setUnitPrice(safeGet(newItemDto.getUnitPrice()));
                newItem.setKdv(safeGet(newItemDto.getKdv()));
                newItem.setUnit(Objects.requireNonNullElse(newItemDto.getUnit(), material.getUnit()));

                oldItems.add(newItem);
            } else {
                PurchaseInvoiceItem oldItem = oldItems.stream()
                        .filter(i -> i.getId().equals(newItemDto.getId()))
                        .findFirst()
                        .orElseThrow();

                oldItem.setMaterial(material);
                oldItem.setQuantity(safeGet(newItemDto.getQuantity()));
                oldItem.setUnitPrice(safeGet(newItemDto.getUnitPrice()));
                oldItem.setUnit(Objects.requireNonNullElse(newItemDto.getUnit(), material.getUnit()));
                oldItem.setKdv(safeGet(newItemDto.getKdv()));
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

        }
        total = total.add(kdvToplam).setScale(2, RoundingMode.HALF_UP);

        oldInvoice.setKdvToplam(kdvToplam);
        oldInvoice.setTotalPrice(total);

        LocalDate start = LocalDate.of(invoiceDto.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(invoiceDto.getDate().getYear(), 12, 31);

        OpeningVoucher newVoucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        newCustomer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(newCustomer, company, start));

        newVoucher.setFinalBalance(safeGet(newVoucher.getFinalBalance()).subtract(total));
        newVoucher.setCredit(safeGet(newVoucher.getCredit()).add(total));
        openingVoucherRepository.save(oldVoucher);

        openingVoucherRepository.save(newVoucher);
        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(oldInvoice);

        for (PurchaseInvoiceItem item : savedInvoice.getItems()) {
            saveHistoryPrice(item, savedInvoice, newCustomer, company);
        }

        return convertToDto(savedInvoice);
    }

    @Override
    @Transactional
    public void deletePurchaseInvoice(Long id, String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        PurchaseInvoice purchaseInvoice = purchaseInvoiceRepository.findByIdAndCompany(id, company)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.FATURA_BULUNAMADI)));

        Customer customer = purchaseInvoice.getCustomer();

        if (!purchaseInvoice.getCompany().getId().equals(company.getId())) {
            throw new BaseException(new ErrorMessage(MessageType.SIRKET_YETKISIZ));
        }

        LocalDate start = LocalDate.of(purchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate end = LocalDate.of(purchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                        customer.getId(), company, start, end)
                .orElseGet(() -> getDefaultVoucher(customer, company, start));

        for (PurchaseInvoiceItem item : purchaseInvoice.getItems()) {
            materialPriceHistoryRepository.deleteByMaterialIdAndInvoiceIdAndCompany(
                    item.getMaterial().getId(), id, company);
        }

        voucher.setFinalBalance(safeGet(voucher.getFinalBalance()).add(safeGet(purchaseInvoice.getTotalPrice())));
        voucher.setCredit(safeGet(voucher.getCredit()).subtract(safeGet(purchaseInvoice.getTotalPrice())));

        openingVoucherRepository.save(voucher);
        purchaseInvoiceRepository.deleteById(id);
    }

    @Override
    public Page<InvoiceDto> getPurchaseInvoiceByDateBetween(int page, int size, String search, int year,
                                                            String schemaName) {
        Company company = companyRepository.findBySchemaName(schemaName);

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());

        String searchParam;
        if (search == null || search.trim().isEmpty()) {
            searchParam = "";
        } else {
            searchParam = "%" + search.toLowerCase(Locale.forLanguageTag("tr-TR")).trim() + "%";
        }

        Page<PurchaseInvoice> pagedInvoice = purchaseInvoiceRepository
                .findByCompanyAndSearchAndDateBetween(company, searchParam, start, end, pageable);

        return pagedInvoice.map(this::convertToDto);
    }

    private void saveHistoryPrice(PurchaseInvoiceItem item, PurchaseInvoice invoice, Customer customer,
                                  Company company) {
        MaterialPriceHistory materialPriceHistory = new MaterialPriceHistory();
        materialPriceHistory.setMaterial(item.getMaterial());
        materialPriceHistory.setPrice(safeGet(item.getUnitPrice()));
        materialPriceHistory.setInvoiceId(Objects.requireNonNullElse(invoice.getId(), 999L));
        materialPriceHistory.setDate(Objects.requireNonNullElse(invoice.getDate(), LocalDate.now()));
        materialPriceHistory.setInvoiceType(InvoiceType.PURCHASE);
        materialPriceHistory.setQuantity(safeGet(item.getQuantity()));
        materialPriceHistory.setCustomer(customer);
        materialPriceHistory.setCustomerName(Objects.requireNonNullElse(customer.getName(), ""));
        materialPriceHistory.setCompany(company);
        materialPriceHistoryRepository.save(materialPriceHistory);
    }

    private InvoiceDto convertToDto(PurchaseInvoice purchaseInvoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(purchaseInvoice.getId());
        dto.setCustomerId(purchaseInvoice.getCustomer().getId());
        dto.setCompanyId(purchaseInvoice.getCompany().getId());
        dto.setDate(purchaseInvoice.getDate());
        dto.setTotalPrice(purchaseInvoice.getTotalPrice());
        dto.setInvoiced(purchaseInvoice.isInvoiced());
        dto.setCustomerName(purchaseInvoice.getCustomer().getName());
        dto.setEurSellingRate(purchaseInvoice.getEurSellingRate());
        dto.setUsdSellingRate(purchaseInvoice.getUsdSellingRate());
        dto.setKdvToplam(purchaseInvoice.getKdvToplam());
        dto.setFileNo(purchaseInvoice.getFileNo());
        dto.setCustomerCode(purchaseInvoice.getCustomer().getCode());

        LocalDate invoiceStart = LocalDate.of(purchaseInvoice.getDate().getYear(), 1, 1);
        LocalDate invoiceEnd = LocalDate.of(purchaseInvoice.getDate().getYear(), 12, 31);

        OpeningVoucher voucher = openingVoucherRepository.findByCustomerIdAndCompanyAndDateBetween(
                purchaseInvoice.getCustomer().getId(),
                purchaseInvoice.getCompany(),
                invoiceStart,
                invoiceEnd
        ).orElseGet(() -> getDefaultVoucher(purchaseInvoice.getCustomer(), purchaseInvoice.getCompany(), invoiceStart));

        dto.setFinalBalance(voucher.getFinalBalance());

        List<InvoiceItemDto> invoiceItemDtos = new ArrayList<>();

        for (PurchaseInvoiceItem item : purchaseInvoice.getItems()) {
            InvoiceItemDto itemDto = new InvoiceItemDto();
            itemDto.setId(item.getId());
            itemDto.setCompanyId(item.getCompany().getId());
            itemDto.setMaterialId(item.getMaterial().getId());
            itemDto.setKdvTutar(item.getKdvTutar());
            itemDto.setMaterialName(item.getMaterial().getComment());
            itemDto.setLineTotal(item.getLineTotal());
            itemDto.setKdv(item.getKdv());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnit(item.getUnit());
            itemDto.setInvoiceId(purchaseInvoice.getId());
            itemDto.setMaterialCode(item.getMaterial().getCode());

            invoiceItemDtos.add(itemDto);
        }
        dto.setItems(invoiceItemDtos);
        return dto;
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
        newVoucher.setDate(Objects.requireNonNullElse(start, LocalDate.now()));
        newVoucher.setCustomer(customer);
        return newVoucher;
    }

    private BigDecimal safeGet(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
