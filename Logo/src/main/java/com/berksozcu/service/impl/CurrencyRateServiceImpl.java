package com.berksozcu.service.impl;

import com.berksozcu.entites.currency.CurrencyRate;
import com.berksozcu.entites.material_price_history.InvoiceType;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CurrencyRateRepository;
import com.berksozcu.repository.PurchaseInvoiceRepository;
import com.berksozcu.repository.SalesInvoiceRepository;
import com.berksozcu.service.ICurrencyRateService;
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
public class CurrencyRateServiceImpl implements ICurrencyRateService {

    private static final String TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
    @Autowired
    private CurrencyRateRepository currencyRateRepository;
    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

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
            throw new BaseException(new ErrorMessage(MessageType.KUR_HATASI));
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

    @Override
    public String generateFileNo(LocalDate date, InvoiceType type) {
        LocalDate start = LocalDate.of(date.getYear(), 1, 1);
        LocalDate end = LocalDate.of(date.getYear(), 12, 31);

        String lastNo = type == InvoiceType.PURCHASE ? purchaseInvoiceRepository.findMaxFileNoByYear(start, end)
                : salesInvoiceRepository.findMaxFileNoByYear(start, end);

        if (lastNo == null || lastNo.isBlank()) {
            return String.format("SÖZ%d001", date.getYear());
        }
        try {
            String numberPart = lastNo.substring(lastNo.length() - 3);
            int nextNumber = Integer.parseInt(numberPart) + 1;

            return String.format("SÖZ%d%03d", date.getYear(), nextNumber);
        } catch (Exception e) {
            return String.format("SÖZ%d001", date.getYear());
        }
    }

}
