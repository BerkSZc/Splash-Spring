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
    SIRKET_KODU_MEVCUT(1014, "Şirket kodu mevcut farklı bir kod kullanın."),
    YANLIS_SIFRE(1011, "Şifreniz yanlış"),
    ARSIV_MUSTERI(1012, "Arşivdeki müşteriye işlem yapılamaz"),
    FATURA_NO_MEVCUT(1015, "Fatura No Mevcut"),
    BORDRO_HATA(1014, "Bordo işlemi bulunamadı"),
    SIRKET_HATA(1013, "Şirket kodu veya adı boş olamaz"),
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
