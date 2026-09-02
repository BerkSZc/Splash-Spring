package com.berksozcu.service;

import com.berksozcu.dto.mail.MailLogResponseDto;
import com.berksozcu.dto.mail.SendMailRequestDto;

public interface IMailService {
     void sendGenericMail(SendMailRequestDto request);
     void sendMailAsync(SendMailRequestDto request);
     MailLogResponseDto getLastMailLog();
}
