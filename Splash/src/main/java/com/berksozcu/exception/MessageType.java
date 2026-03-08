package com.berksozcu.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public enum MessageType {

    MUSTERI_BULUNAMADI(1001,"Müşteri mevcut değil"),
    MALZEME_BULUNAMADI(1002,"Malzeme mevcut değil"),
    FATURA_BULUNAMADI(1003, "Fatura bulunamadı"),
    TAHSILAT_BULUNAMADI(1004, "Tahsilat bulunamadı"),
    ODEME_BULUNAMADI(1005, "Ödeme bulunamadı"),
    KULLANICI_BULUNAMADI(1006, "Kullanıcı bulunamadı"),
    KULLANICI_MEVCUT(1007, "Kullanıcı Mevcut"),
    SIFRE_HATA(1008, "Şifre en az 8 karakter olmalı"),
    ARP_BILGISI_EKSIK(1009, "ARP bilgisi Eksik"),
    ARP_KODU_BOS(1010, "ARP kodu boş"),
    YANLIS_SIFRE(1011, "Şifreniz yanlış"),
    ARSIV_MUSTERI(1012, "Arşivdeki müşteriye işlem yapılamaz"),
    SIRKET_HATA(1013, "Şirket kodu veya adı boş olamaz"),
    SIRKET_KODU_MEVCUT(1014, "Şirket kodu mevcut farklı bir kod kullanın."),
    FATURA_NO_MEVCUT(1015, "Fatura No Mevcut"),
    KUR_HATASI(1016, "Kur bilgisi alınamadı"),
    BIRIM_YOK(1017, "Birim mevcut değil"),
    MALZEME_KODU_MEVCUT(1018, "Malzeme kodu mevcut"),
    MUSTERI_KOD_MEVCUT(1019,"Müşteri kodu mevcut"),
    SIRKET_YETKISIZ(1020, "Bu faturayı düzenlemeye yetkiniz yok"),
    KULLANICI_SIRKET_HATA(1021, "Bu kullanıcı bu şirkete kayıtlı değil!"),
    SIRKET_OLUSTURULMADI(1022, "Şirket oluşturulamadı"),
    SIRKET_BULUNAMADI(1023, "Lütfen Şirket Seçin!"),
    MALZEME_ALAN_BOS(1024, "Malzeme Alanlarını doldurun!"),
    SIRKET_ISIM_HATA(1025, "Şirket Kodu Hatalı!"),
    BORDRO_HATA(1026, "Bordo işlemi bulunamadı"),
    BORDRO_MEVCUT(1027, "Bordo işlemi seri no mevcut"),
    MALI_YIL_MEVCUT(1028, "Şirket mali yılı mevcut"),
    ISLEM_MEVCUT(1029, "İşlem no mevcut"),
    SIRKET_YIL_MEVCUT_DEGIL(1030, "Lütfen Şirket İçin Bir Mali Yılı Oluşturun"),
    MALZEME_KULLANIMDA(1031, "Faturalarda Kullanılan Malzemeler Silinemez!");

    private Integer code;
    private String message;

     MessageType(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

}
