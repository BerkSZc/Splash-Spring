package com.berksozcu.service;

import com.berksozcu.entites.collections.PaymentCompany;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.company.Year;
import com.berksozcu.entites.customer.Customer;
import com.berksozcu.entites.customer.OpeningVoucher;
import com.berksozcu.exception.BaseException;
import com.berksozcu.repository.*;
import com.berksozcu.service.impl.PaymentCompanyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentCompanyServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private PaymentCompanyRepository paymentCompanyRepository;
    @Mock
    private OpeningVoucherRepository openingVoucherRepository;
    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private PaymentCompanyServiceImpl paymentCompanyServiceImpl;

    private Customer mockCustomer;
    private PaymentCompany mockPayment;
    private Company mockCompany;
    private OpeningVoucher mockOpeningVoucher;

    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setId(1L);
        mockCustomer.setName("BERK");
        mockCustomer.setArchived(false);
        mockCustomer.setCode("1C");

        mockCompany = new Company();
        mockCompany.setId(10L);
        mockCompany.setSchemaName("company");

        Year mockYear = new Year();
        mockYear.setCompany(mockCompany);
        mockYear.setYearValue(2025);

        mockCompany.setYears(List.of(mockYear));

        mockPayment = new PaymentCompany();
        mockPayment.setId(1L);
        mockPayment.setFileNo("A1231");
        mockPayment.setPrice(new BigDecimal("100.00"));
        mockPayment.setCompany(mockCompany);
        mockPayment.setCustomer(mockCustomer);
        mockPayment.setDate(LocalDate.of(2026, 5, 10));

        mockOpeningVoucher = new OpeningVoucher();
        mockOpeningVoucher.setId(1L);
        mockOpeningVoucher.setCustomer(mockCustomer);
        mockOpeningVoucher.setDebit(new BigDecimal("100.00"));
        mockOpeningVoucher.setFinalBalance(new BigDecimal("100.00"));
    }

    @Test
    void addPaymentCompany_ShouldThrowException_WhenCustomerNotExists() {
        Long nonExistentCustomerId = 99L;

        when(customerRepository.findById(nonExistentCustomerId)).thenReturn(Optional.empty());

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.addPaymentCompany(nonExistentCustomerId, mockPayment, "company"));

        assertEquals("Hata Kodu: 1001 Müşteri mevcut değil", exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void addPaymentCompany_ShouldThrowException_WhenCustomerIsArchived() {
        mockCustomer.setArchived(true);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.addPaymentCompany(1L, mockPayment, "company"));

        assertEquals("Hata Kodu: 1012 Arşivdeki müşteriye işlem yapılamaz", exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void addPaymentCompany_ShouldThrowException_WhenFileNoExists() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(paymentCompanyRepository.existsByFileNo(any())).thenReturn(true);

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.addPaymentCompany(1L, mockPayment, "company"));

        assertEquals("Hata Kodu: 1019 İşlem no mevcut", exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void addPaymentCompany_ShouldFillDefaultValues_WhenInputIsMissing() {
        mockPayment.setPrice(null);
        mockPayment.setFileNo(null);
        mockCustomer.setName(null);
        mockPayment.setDate(null);
        mockPayment.setComment(null);

        when(customerRepository.findById(anyLong())).thenReturn(Optional.of(mockCustomer));
        when(companyRepository.findBySchemaName(anyString())).thenReturn(mockCompany);

        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.of(mockOpeningVoucher));

        paymentCompanyServiceImpl.addPaymentCompany(1L, mockPayment, "company");

        assertEquals(BigDecimal.ZERO, mockPayment.getPrice());
        assertEquals("", mockPayment.getCustomerName());
        assertEquals("", mockPayment.getFileNo());
        assertEquals(LocalDate.now(), mockPayment.getDate());
        assertEquals("", mockPayment.getComment());

        verify(openingVoucherRepository, times(1)).save(mockOpeningVoucher);
        verify(paymentCompanyRepository, times(1)).save(mockPayment);
    }

    @Test
    void addPaymentCompany_ShouldUpdateVoucherBalancesAndSaveEverything() {

        when(customerRepository.findById(1L)).thenReturn(Optional.of(mockCustomer));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);
        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any())).thenReturn(Optional.of(mockOpeningVoucher));

        paymentCompanyServiceImpl.addPaymentCompany(1L, mockPayment, "company");

        assertEquals(new BigDecimal("200.00"), mockOpeningVoucher.getFinalBalance());
        assertEquals(new BigDecimal("200.00"), mockOpeningVoucher.getDebit());

        verify(paymentCompanyRepository, times(1)).save(mockPayment);
        verify(openingVoucherRepository, times(1)).save(mockOpeningVoucher);
    }

    @Test
    void editPaymentCompany_ShouldThrowException_WhenPaymentNotFound() {
       Long paymentId = 1L;

        when(paymentCompanyRepository.findById(paymentId)).thenReturn(Optional.empty());

        BaseException exception = assertThrows(BaseException.class, () ->
        paymentCompanyServiceImpl.editPaymentCompany(paymentId, mockPayment, "company"));

        assertEquals("Hata Kodu: 1005 Ödeme bulunamadı", exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void editPaymentCompany_ShouldThrowException_WhenFileNoExistsAndNewFileNoNotExists() {

        PaymentCompany request = new PaymentCompany();
        request.setFileNo("ASSS1");

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);
        when(paymentCompanyRepository.existsByFileNo(request.getFileNo())).thenReturn(true);

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.editPaymentCompany(1L, request, "company")
        );
        assertEquals("Hata Kodu: 1019 İşlem no mevcut" ,exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void editPaymentCompany_ShouldThrowException_WhenCompanyIdIsInvalid() {

        Company request = new Company();
        request.setId(2L);

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(request);

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.editPaymentCompany(1L, mockPayment, "company"));

        assertEquals("Hata Kodu: 1020 Bu faturayı düzenlemeye yetkiniz yok", exception.getMessage());
        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void editPaymentCompany_ShouldTransferBalance_WhenCustomerChange() {
        Customer newCustomer = new Customer();
        newCustomer.setId(1L);

        PaymentCompany request = new PaymentCompany();
        request.setPrice(new BigDecimal("150.00"));
        request.setFileNo("NEW-123");
        request.setCustomer(newCustomer);

        OpeningVoucher newOpeningVoucher = new OpeningVoucher();
        newOpeningVoucher.setDebit(new BigDecimal("500.00"));
        newOpeningVoucher.setFinalBalance(new BigDecimal("500.00"));

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);
        when(paymentCompanyRepository.existsByFileNo(request.getFileNo())).thenReturn(false);

        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.of(mockOpeningVoucher))
                .thenReturn(Optional.of(newOpeningVoucher));

        paymentCompanyServiceImpl.editPaymentCompany(1L, request, "company");

        assertEquals(0, BigDecimal.ZERO.compareTo(mockOpeningVoucher.getFinalBalance()));
        assertEquals(0 , BigDecimal.ZERO.compareTo(mockOpeningVoucher.getDebit()));

        assertEquals(0, new BigDecimal("650.00").compareTo(newOpeningVoucher.getFinalBalance()));
        assertEquals(0, new BigDecimal("650.00").compareTo(newOpeningVoucher.getDebit()));

        verify(openingVoucherRepository, times(1)).save(mockOpeningVoucher);
        verify(openingVoucherRepository, times(1)).save(newOpeningVoucher);
        verify(paymentCompanyRepository, times(1)).save(mockPayment);
    }

    @Test
    void editPaymentCompany_ShouldCreateDefaultVoucher_WithInitialValues() {

        Long paymentId = 1L;

        ArgumentCaptor<OpeningVoucher> voucherCaptor = ArgumentCaptor.forClass(OpeningVoucher.class);

        when(paymentCompanyRepository.findById(paymentId)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);
        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.empty());

        when(openingVoucherRepository.save(any(OpeningVoucher.class))).thenAnswer(i -> {
            OpeningVoucher input = i.getArgument(0);
            if (BigDecimal.ZERO.equals(input.getFinalBalance())) {
                throw new RuntimeException("HATA");
            }
            return input;
        });

        try {
            paymentCompanyServiceImpl.editPaymentCompany(paymentId, mockPayment, "company");
        } catch (RuntimeException e) {
            assertEquals("HATA", e.getMessage());
        }

        verify(openingVoucherRepository).save(voucherCaptor.capture());
        OpeningVoucher captured = voucherCaptor.getValue();

        assertEquals("Eklendi", captured.getDescription());
        assertEquals("001", captured.getFileNo());
        assertEquals(0, captured.getFinalBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, captured.getDebit().compareTo(BigDecimal.ZERO));
        assertEquals(0, captured.getCredit().compareTo(BigDecimal.ZERO));
        assertEquals(0, captured.getYearlyCredit().compareTo(BigDecimal.ZERO));
        assertEquals(0, captured.getYearlyDebit().compareTo(BigDecimal.ZERO));
        assertEquals(mockCustomer, captured.getCustomer());
        assertEquals(mockCompany, captured.getCompany());
        assertEquals(mockCustomer.getName(), captured.getCustomerName());
        assertEquals(LocalDate.of(captured.getDate().getYear(), 1, 1), captured.getDate());
    }

    @Test
    void editPaymentCompany_ShouldUpdateFinalBalanceAndDebit_AfterExceptions() {
        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);

        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.of(mockOpeningVoucher))
                .thenThrow(new RuntimeException("Test Durduruldu"));

        try {
            paymentCompanyServiceImpl.editPaymentCompany(1L, mockPayment, "company");
        } catch (RuntimeException e) {
            //HATA
        }

        assertEquals(0, new BigDecimal("0.00").compareTo(mockOpeningVoucher.getFinalBalance()));
        assertEquals(0, new BigDecimal("0.00").compareTo(mockOpeningVoucher.getDebit()));

        verify(openingVoucherRepository, never()).save(any());
    }

    @Test
    void editPaymentCompany_ShouldFillDefaultValues_WhenInputIsMissing() {

        PaymentCompany inputPayment = new PaymentCompany();
        inputPayment.setCustomer(mockCustomer);
        inputPayment.setDate(null);
        inputPayment.setPrice(null);
        inputPayment.setComment(null);
        inputPayment.setFileNo(null);
        inputPayment.setCustomerName(null);

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);

        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any())).
                thenReturn(Optional.of(mockOpeningVoucher))
                .thenThrow(new RuntimeException("Test Durduruldu"));

        try {
        paymentCompanyServiceImpl.editPaymentCompany(1L, inputPayment, "company");
        } catch (RuntimeException e) {
            // HATA
        }

        assertEquals(LocalDate.now(), mockPayment.getDate());
        assertEquals("", mockPayment.getComment());
        assertEquals(BigDecimal.ZERO, mockPayment.getPrice());
        assertEquals("", mockPayment.getFileNo());
        assertEquals("", mockPayment.getCustomerName());

        verify(paymentCompanyRepository, never()).save(any());
    }

    @Test
    void editPaymentCompany_ShouldUpdateVoucherBalanceAndSaveEverything() {

        OpeningVoucher newOpeningVoucher = new OpeningVoucher();
        newOpeningVoucher.setId(1L);
        newOpeningVoucher.setFinalBalance(new BigDecimal("100.00"));
        newOpeningVoucher.setDebit(new BigDecimal("0.00"));

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);

        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.of(mockOpeningVoucher))
                .thenReturn(Optional.of(newOpeningVoucher));

        paymentCompanyServiceImpl.editPaymentCompany(1L, mockPayment, "company");

        assertEquals(new BigDecimal("200.00"), newOpeningVoucher.getFinalBalance());
        assertEquals(new BigDecimal("100.00"), newOpeningVoucher.getDebit());

        verify(openingVoucherRepository).save(mockOpeningVoucher);
        verify(paymentCompanyRepository).save(mockPayment);
    }

    @Test
    void deletePaymentCompany_ShouldThrowException_WhenPaymentNotFound() {

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.empty());

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.deletePaymentCompany(1L, "company"));

        assertEquals("Hata Kodu: 1005 Ödeme bulunamadı", exception.getMessage());

        verify(paymentCompanyRepository, never()).delete(any());
    }

    @Test
    void deletePaymentCompany_ShouldThrowException_WhenCompanyIdIsInvalid() {

        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(new Company());

        BaseException exception = assertThrows(BaseException.class, () ->
                paymentCompanyServiceImpl.deletePaymentCompany(1L, "company"));

    assertEquals("Hata Kodu: 1020 Bu faturayı düzenlemeye yetkiniz yok", exception.getMessage());
    verify(paymentCompanyRepository, never()).delete(any());
    }

    @Test
    void deletePaymentCompany_ShouldUpdateVoucherBalanceAndSaveEverything() {
        when(paymentCompanyRepository.findById(1L)).thenReturn(Optional.of(mockPayment));
        when(companyRepository.findBySchemaName("company")).thenReturn(mockCompany);
        when(openingVoucherRepository.findByCustomerIdAndDateBetween(anyLong(), any(), any()))
                .thenReturn(Optional.of(mockOpeningVoucher));

        paymentCompanyServiceImpl.deletePaymentCompany(1L, "company");

        assertEquals(new BigDecimal("0.00"), mockOpeningVoucher.getFinalBalance());
        assertEquals(new BigDecimal("0.00"), mockOpeningVoucher.getDebit());

        verify(openingVoucherRepository).save(mockOpeningVoucher);
        verify(paymentCompanyRepository).deleteById(1L);
    }
}
