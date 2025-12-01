package com.berksozcu.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum MessageType {

    MUSTERI_BULUNAMADI(1001,"Müşteri mevcut değil"),
    MALZEME_BULUNAMADI(1002,"Malzeme mevcut değil");

    private Integer code;
    private String message;

     MessageType(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

}
