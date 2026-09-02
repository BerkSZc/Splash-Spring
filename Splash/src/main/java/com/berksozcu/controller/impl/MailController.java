package com.berksozcu.controller.impl;

import com.berksozcu.annotation.RateLimit;
import com.berksozcu.dto.mail.MailLogResponseDto;
import com.berksozcu.dto.mail.SendMailRequestDto;
import com.berksozcu.service.IMailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest/api/mail")
@RateLimit(capacity = 150)
public class MailController {

    @Autowired
    private IMailService mailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendMail(@RequestBody SendMailRequestDto request) {
        mailService.sendGenericMail(request);
        return ResponseEntity.ok("Mail gönderim kuyruğuna alındı.");
    }

    @GetMapping("/last-log")
    public ResponseEntity<MailLogResponseDto> getLastMailLog() {
        return ResponseEntity.ok(mailService.getLastMailLog());
    }
}