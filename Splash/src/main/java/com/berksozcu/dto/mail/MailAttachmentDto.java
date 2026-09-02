package com.berksozcu.dto.mail;

import lombok.Data;

@Data
public class MailAttachmentDto {
    private String fileName;
    private String base64Data;
}
