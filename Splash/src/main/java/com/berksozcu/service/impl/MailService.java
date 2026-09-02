package com.berksozcu.service.impl;

import com.berksozcu.dto.mail.MailAttachmentDto;
import com.berksozcu.dto.mail.MailLogResponseDto;
import com.berksozcu.dto.mail.SendMailRequestDto;
import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.mail_log.MailLog;
import com.berksozcu.entites.user.User;
import com.berksozcu.exception.BaseException;
import com.berksozcu.exception.ErrorMessage;
import com.berksozcu.exception.MessageType;
import com.berksozcu.repository.CompanyRepository;
import com.berksozcu.repository.MailLogRepository;
import com.berksozcu.service.IMailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Base64;

@Service
public class MailService implements IMailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from-address:${spring.mail.username}}")
    private String fromAddress;

    @Value("${app.mail.from-name:Firma Muhasebe}")
    private String fromName;

    @Autowired
    private MailLogRepository mailLogRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public void sendGenericMail(SendMailRequestDto request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Company currentCompany = companyRepository.findById(currentUser.getLastLoggedCompanyId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.SIRKET_BULUNAMADI)));

        sendMailAsync(request);

        String logFileName = "Fatura.pdf";
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            logFileName = request.getAttachments().size() + " Adet Fatura";
        } else if (request.getAttachFileName() != null) {
            logFileName = request.getAttachFileName();
        }

        MailLog log = MailLog.builder()
                .userId(currentUser)
                .companyId(currentCompany)
                .to(request.getTo())
                .subject(request.getSubject())
                .body(request.getBody())
                .fileName(logFileName)
                .build();

        mailLogRepository.save(log);
    }

    @Async
    @Override
    public void sendMailAsync(SendMailRequestDto request) {
        try {
            if (request.getTo() == null || request.getTo().trim().isEmpty()) {
                throw new IllegalArgumentException("Alıcı mail adresi boş olamaz!");
            }

            String[] recipients = Arrays.stream(request.getTo().split("[;,]"))
                    .map(String::trim)
                    .filter(email -> !email.isEmpty() && email.contains("@"))
                    .toArray(String[]::new);

            if (recipients.length == 0) {
                throw new IllegalArgumentException("Geçerli bir mail adresi bulunamadı!");
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipients);
            helper.setSubject(request.getSubject() != null ? request.getSubject() : "Bilgilendirme");
            helper.setText(request.getHtmlContent() != null ? request.getHtmlContent() : "", true);

            if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
                System.out.println("👉 [BACKEND] Gelen Toplam Ek Sayısı: " + request.getAttachments().size());

                for (MailAttachmentDto att : request.getAttachments()) {
                    if (att.getBase64Data() != null && !att.getBase64Data().trim().isEmpty()) {
                        byte[] pdfBytes = Base64.getDecoder().decode(att.getBase64Data().trim());

                        String rawName = (att.getFileName() != null && !att.getFileName().trim().isEmpty())
                                ? att.getFileName() : "Fatura.pdf";

                        if (!rawName.toLowerCase().endsWith(".pdf")) {
                            rawName += ".pdf";
                        }

                        String safeName = rawName
                                .replace("İ", "I")
                                .replace("ı", "i")
                                .replace("Ş", "S")
                                .replace("ş", "s")
                                .replace("Ğ", "G")
                                .replace("ğ", "g")
                                .replace("Ü", "U")
                                .replace("ü", "u")
                                .replace("Ö", "O")
                                .replace("ö", "o")
                                .replace("ç", "c")
                                .replace("Ç", "C");

                        helper.addAttachment(safeName, new ByteArrayResource(pdfBytes), "application/pdf");
                        System.out.println("👉 [BACKEND] Ek Maile Bağlandı: " + safeName + " (" + pdfBytes.length + " bytes)");
                    } else {
                        System.out.println("⚠️ [BACKEND] Bir ekin base64Data alanı boş geldi!");
                    }
                }
            }
            else if (request.getAttachPdfBase64() != null && !request.getAttachPdfBase64().isEmpty()) {
                byte[] pdfBytes = Base64.getDecoder().decode(request.getAttachPdfBase64().trim());
                String fileName = request.getAttachFileName() != null ? request.getAttachFileName() : "Belge.pdf";
                helper.addAttachment(fileName, new ByteArrayResource(pdfBytes), "application/pdf");
            } else {
                System.out.println("⚠️ [BACKEND] Hiçbir dosya eki bulunamadı!");
            }

            mailSender.send(mimeMessage);
            System.out.println("✅ [BACKEND] Mail sunucuya başarıyla teslim edildi.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseException(new ErrorMessage(MessageType.GECERSIZ_MAIL));
        }
    }

    @Override
    public MailLogResponseDto getLastMailLog() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long companyId = currentUser.getLastLoggedCompanyId();

        if (companyId == null) {
            return null;
        }

        return mailLogRepository.findFirstByCompanyId_IdOrderByIdDesc(companyId)
                .map(log -> MailLogResponseDto.builder()
                        .to(log.getTo())
                        .subject(log.getSubject())
                        .body(log.getBody())
                        .build())
                .orElse(null);
    }
}