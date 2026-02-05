package com.berksozcu.service.impl;

import com.berksozcu.entites.currency.CurrencyRate;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.entites.payroll.PayrollModel;
import com.berksozcu.entites.payroll.PayrollType;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.*;
import com.berksozcu.service.ICommonDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.math.BigDecimal;
import java.time.LocalDate;


@Service
public class CommonDataServiceImpl implements ICommonDataService {

    private static final String TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
    @Autowired
    private CurrencyRateRepository currencyRateRepository;
    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @Autowired
    private PayrollRepository payrollRepository;
    @Autowired
    private ReceivedCollectionRepository receivedCollectionRepository;
    @Autowired
    private PaymentCompanyRepository paymentCompanyRepository;


    @Scheduled(cron = "0 0 10 * * *")
    @Override
    public void updateRatesFromTcmb() {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(TCMB_URL);

            NodeList nodeList = doc.getElementsByTagName("Currency");

            for (int i = 0; i < nodeList.getLength(); i++) {
                Element element = (Element) nodeList.item(i);
                String code = element.getAttribute("CurrencyCode");

                if (code.equals("USD") || code.equals("EUR")) {
                    saveOrUpdateRate(code, element);
                }
            }
        } catch (Exception e) {
            System.out.println("Kur bilgisi alınamadı");
//            throw new BaseException(new ErrorMessage(MessageType.KUR_HATASI));
        }
    }

    @Override
    public BigDecimal getRateOrDefault(String currency, LocalDate invoiceDate) {

        return currencyRateRepository.findFirstByCurrencyAndLastUpdatedOrderByLastUpdatedDesc(
                        currency, invoiceDate)
                .map(CurrencyRate::getSellingRate)
                .orElse(BigDecimal.ONE);
    }

    @Override
    public BigDecimal getTodaysRate(String code, LocalDate invoiceDate) {

        return currencyRateRepository.findFirstByCurrencyAndLastUpdatedOrderByLastUpdatedDesc(code, invoiceDate)
                .map(CurrencyRate::getSellingRate)
                .orElse(BigDecimal.ONE);
    }

    @Override
    public String generateFileNo(LocalDate date, String type) {
        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        String lastNo;
        String prefix;

     switch (type.toUpperCase()) {
            case "PURCHASE" ->{
                lastNo = purchaseInvoiceRepository.findMaxFileNoByYear(start, end);
                prefix = "ALIS";
            }
            case "SALES" -> {
                lastNo = salesInvoiceRepository.findMaxFileNoByYear(start, end);
                prefix = "SOZ";
            }
            case "COLLECTION" -> {
                lastNo = receivedCollectionRepository.findMaxFileNoByYear(start, end);
                prefix = "TAH";
            }
            case "PAYMENT" -> {
                lastNo = paymentCompanyRepository.findMaxFileNoByYear(start, end);
                prefix = "ODEME";
            }
            case "CHEQUE_IN" -> {
                lastNo = payrollRepository.findMaxFileNoByYearAndModelAndType(start, end, PayrollModel.INPUT, PayrollType.CHEQUE, "%GCEK%");
                prefix = "GCEK";
            }
            case "CHEQUE_OUT" -> {
                lastNo = payrollRepository.findMaxFileNoByYearAndModelAndType(start, end, PayrollModel.OUTPUT, PayrollType.CHEQUE, "%CCEK%");
                prefix = "CCEK";
            }
            case "BOND_IN" -> {
                lastNo = payrollRepository.findMaxFileNoByYearAndModelAndType(start, end, PayrollModel.INPUT, PayrollType.BOND, "%GSENET%");
                prefix = "GSENET";
            }
            case "BOND_OUT" -> {
                lastNo = payrollRepository.findMaxFileNoByYearAndModelAndType(start, end, PayrollModel.OUTPUT, PayrollType.BOND, "%CSENET%");
                prefix = "CSENET";
            }
            default -> {
                lastNo = null;
                prefix = "SOZ";
            }
        };

        if (lastNo == null || lastNo.isBlank() || !lastNo.startsWith(prefix)) {
            return String.format("%s%d001", prefix ,date.getYear());
        }

        try {
            String numberPart = lastNo.substring(lastNo.length() - 3);
            int nextNumber = Integer.parseInt(numberPart) + 1;

            return String.format("%s%d%03d", prefix, date.getYear(), nextNumber);
        } catch (Exception e) {
            return String.format("%s%d001", prefix, date.getYear());
        }
    }

    private void saveOrUpdateRate(String code, Element element) {

        LocalDate today = LocalDate.now();

        CurrencyRate rate = currencyRateRepository.findByCurrencyAndLastUpdated(code, today).
                orElse(new CurrencyRate());

        rate.setCurrency(code);

        String buyingRate = element.getElementsByTagName("ForexBuying").item(0).getTextContent();
        String sellingRate = element.getElementsByTagName("ForexSelling").item(0).getTextContent();

        rate.setSellingRate(sellingRate != null ? new BigDecimal(sellingRate) : BigDecimal.ONE);
        rate.setBuyingRate(buyingRate != null ? new BigDecimal(buyingRate) : BigDecimal.ONE);
        rate.setLastUpdated(today);

        currencyRateRepository.save(rate);
    }

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    private void onStartup() {
        System.out.println(">>> UYGULAMA BASLATILDI: TCMB Kurlari veritabanina isleniyor...");
        updateRatesFromTcmb();
    }
}
