package com.berksozcu.dto.mail;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SendMailRequestDto {
    private String to;
    private String subject;
    private String body;
    private String htmlContent;
    private String attachPdfBase64;
    private String attachFileName;

    private List<MailAttachmentDto> attachments;
}