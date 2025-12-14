package com.berksozcu.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum MessageType {

    MUSTERI_BULUNAMADI(1001,"Müşteri mevcut değil"),
    MALZEME_BULUNAMADI(1002,"Malzeme mevcut değil"),
    TAHSILAT_BULUNAMADI(1004, "Tahsilat bulunamadı"),
    KULLANICI_BULUNAMADI(1006, "Kullanıcı bulunamadı"),
    KULLANICI_MEVCUT(1007, "Kullanıcı Mevcut"),
    ARP_BILGISI_EKSIK(1009, "ARP bilgisi Eksik"),
    ARP_KODU_BOS(1010, "ARP kodu boş"),
    YANLIS_SIFRE(1011, "Şifreniz yanlış"),
    SIFRE_HATA(1008, "Şifre en az 8 karakter olmalı"),
    ODEME_BULUNAMADI(1005, "Ödeme bulunamadı"),
    FATURA_BULUNAMADI(1003, "Fatura bulunamadı");

    private Integer code;
    private String message;

     MessageType(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

}
