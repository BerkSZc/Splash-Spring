package com.berksozcu.service.impl;

import com.berksozcu.entites.currency.CurrencyRate;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CurrencyRateRepository;
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
import java.time.LocalDateTime;

@Service
public class CurrencyRateServiceImpl implements ICurrencyRateService {

    @Autowired
    private CurrencyRateRepository currencyRateRepository;

    private static final String TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";


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


    private void saveOrUpdateRate(String code, Element element) {
        CurrencyRate rate = currencyRateRepository.findByCurrency(code).
                orElse(new CurrencyRate());

        rate.setCurrency(code);

        rate.setBuyingRate(new BigDecimal(element.getElementsByTagName("ForexBuying").item(0).getTextContent()));
        rate.setSellingRate(new BigDecimal(element.getElementsByTagName("ForexSelling").item(0).getTextContent()));
        rate.setLastUpdated(LocalDateTime.now());

        currencyRateRepository.save(rate);
    }

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    private void onStartup() {
        System.out.println(">>> UYGULAMA BASLATILDI: TCMB Kurlari veritabanina isleniyor...");
        updateRatesFromTcmb();
    }

}
