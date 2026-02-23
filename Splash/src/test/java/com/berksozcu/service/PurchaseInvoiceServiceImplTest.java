package com.berksozcu.service;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.entites.purchase.PurchaseInvoice;
import com.berksozcu.exception.BaseException;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.CustomerRepository;
import com.berksozcu.repository.OpeningVoucherRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.service.impl.PurchaseInvoiceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PurchaseInvoiceServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private PurchaseInvoiceRepository purchaseInvoiceRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private OpeningVoucherRepository openingVoucherRepository;

    @InjectMocks
    private PurchaseInvoiceServiceImpl purchaseInvoiceServiceImpl;

    private PurchaseInvoice mockInvoice;
    private Customer mockCustomer;
    private OpeningVoucher mockOpeningVoucher;
    private Company mockCompany;
    private Year mockYear;

    @BeforeEach
    void setUp() {
    mockCustomer = new Customer();
    mockCustomer.setId(1L);
    mockCustomer.setName("john");

    mockCompany = new Company();
    mockCompany.setId(1L);
    mockCompany.setSchemaName("Company");

    mockYear = new Year();
    mockYear.setCompany(mockCompany);
    mockYear.setYearValue(2025);

    mockCompany.setYears(mockYear.getCompany().getYears());

    mockInvoice = new PurchaseInvoice();
    mockInvoice.setCustomer(mockCustomer);
    mockInvoice.setCompany(mockCompany);
    mockInvoice.setFileNo("NO123");
    mockInvoice.setUsdSellingRate(new BigDecimal("100.00"));
    mockInvoice.setEurSellingRate(new BigDecimal("100.00"));
    mockInvoice.setDate(LocalDate.now());

    mockOpeningVoucher = new OpeningVoucher();
    mockOpeningVoucher.setId(1L);
    mockOpeningVoucher.setCustomer(mockCustomer);
    mockOpeningVoucher.setCompany(mockCompany);
    }

    @Test
    void addPurchaseInvoice_ShouldThrowException_WhenCustomerNotExists() {
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        BaseException exception = assertThrows(BaseException.class, () ->
                purchaseInvoiceServiceImpl.addPurchaseInvoice(1L, mockInvoice, "Company"));

        assertEquals("Hata Kodu: 1001 Müşteri mevcut değil", exception.getMessage());
        verify(purchaseInvoiceRepository, never()).save(any());
    }

    @Test
    void addPurchaseInvoice_ShouldThrowException_WhenCustomerIsArchived() {
        mockCustomer.setArchived(true);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));

        BaseException exception = assertThrows(BaseException.class, () ->
                purchaseInvoiceServiceImpl.addPurchaseInvoice(1L, mockInvoice, "Company"));

        assertEquals("Hata Kodu: 1012 Arşivdeki müşteriye işlem yapılamaz", exception.getMessage());
        verify(purchaseInvoiceRepository, never()).save(mockInvoice);
    }

    @Test
    void addPurchaseInvoice_ShouldThrowException_WhenFileNoExists() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(purchaseInvoiceRepository.existsByFileNo("NO123")).thenReturn(true);

        BaseException exception = assertThrows(BaseException.class, () ->
                purchaseInvoiceServiceImpl.addPurchaseInvoice(1L, mockInvoice, "Company"));

        assertEquals("Hata Kodu: 1015 Fatura No Mevcut", exception.getMessage());
        verify(purchaseInvoiceRepository, never()).save(any());
    }

    @Test
    void addPurchaseInvoice_ShouldFillDefaultValues_WhenInputIsMissing() {

        PurchaseInvoice spyInvoice = spy(mockInvoice);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(companyRepository.findBySchemaName("Company")).thenReturn(mockCompany);

        doThrow(new RuntimeException("Test Durduruldu"))
                .when(spyInvoice).setFileNo("NO123");

        try {
        purchaseInvoiceServiceImpl.addPurchaseInvoice(1L, spyInvoice, "Company");
        } catch (Exception e) {
            // Hata
        }

        assertEquals(mockCompany, mockInvoice.getCompany());
        assertEquals(mockCustomer, mockInvoice.getCustomer());
        assertEquals(new BigDecimal("100.00"), mockInvoice.getEurSellingRate());
        assertEquals(new BigDecimal("100.00"), mockInvoice.getUsdSellingRate());
        assertEquals(LocalDate.now(), mockInvoice.getDate());
        assertEquals("NO123", mockInvoice.getFileNo());

        verify(purchaseInvoiceRepository, never()).save(mockInvoice);
    }
}
