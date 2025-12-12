package com.berksozcu.exception;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class ErrorMessage {
    private MessageType messageType;

    public String prepareError() {
        return "Hata Kodu: " + messageType.getCode().toString() + " " + messageType.getMessage();
    }
}
