package com.berksozcu.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum MessageType {

    MUSTERI_BULUNAMADI(1001,"Müşteri mevcut değil"),
    MALZEME_BULUNAMADI(1002,"Malzeme mevcut değil"),
    MUSTERI_KOD_MEVCUT(1019,"Müşteri kodu mevcut"),
    TAHSILAT_BULUNAMADI(1004, "Tahsilat bulunamadı"),
    KULLANICI_BULUNAMADI(1006, "Kullanıcı bulunamadı"),
    KULLANICI_MEVCUT(1007, "Kullanıcı Mevcut"),
    ARP_BILGISI_EKSIK(1009, "ARP bilgisi Eksik"),
    ARP_KODU_BOS(1010, "ARP kodu boş"),
    SIRKET_KODU_MEVCUT(1014, "Şirket kodu mevcut farklı bir kod kullanın."),
    YANLIS_SIFRE(1011, "Şifreniz yanlış"),
    ARSIV_MUSTERI(1012, "Arşivdeki müşteriye işlem yapılamaz"),
    SIRKET_BULUNAMADI(1012, "Şirket mevcut değil"),
    KUR_HATASI(1016, "Kur bilgisi alınamadı"),
    FATURA_NO_MEVCUT(1015, "Fatura No Mevcut"),
    MALZEME_ALAN_BOS(1021, "Malzeme Alanlarını doldurun!"),
    BIRIM_YOK(1017, "Birim mevcut değil"),
    BORDRO_HATA(1014, "Bordo işlemi bulunamadı"),
    BORDRO_MEVCUT(1014, "Bordo işlemi seri no mevcut"),
    SIRKET_YETKISIZ(1020, "Bu faturayı düzenlemeye yetkiniz yok"),
    MALI_YIL_MEVCUT(1014, "Şirket mali yılı mevcut"),
    SIRKET_HATA(1013, "Şirket kodu veya adı boş olamaz"),
    SIFRE_HATA(1008, "Şifre en az 8 karakter olmalı"),
    ODEME_BULUNAMADI(1005, "Ödeme bulunamadı"),
    FATURA_BULUNAMADI(1003, "Fatura bulunamadı"),
    MALZEME_KODU_MEVCUT(1018, "Malzeme kodu mevcut"),
    ISLEM_MEVCUT(1019, "İşlem no mevcut");

    private Integer code;
    private String message;

     MessageType(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

}
