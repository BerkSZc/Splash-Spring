# 🚀 SPLASH - Matbaa ve Muhasebe Yönetim Sistemi

SPLASH, matbaalar ve küçük/orta ölçekli işletmeler için geliştirilmiş, malzeme yönetimi faturalandırmaya ve şirkterler arası geçişe kadar tüm süreci uçtan uca yöneten modern bir .exe uygulamasıdır.

## 🚀 Kurulum

1.  **Projeyi klonlayın:**
    ```bash
    git clone [https://github.com/BerkSZc/Splash-Spring.git)
    ```
2.  **Frontend bağımlılıklarını kurun:**
    ```bash
    cd frontend
    npm install
    npm start
    ```
3.  **Backend'i çalıştırın:**
    * `application.properties` dosyasındaki veritabanı ayarlarını yapın.
    * Maven projesini build edin ve çalıştırın.


🧭 Projenin Amacı

Bu projeye başlama motivasyonum, kendi iş yerimizde aktif olarak kullandığımız malzeme tedarik ve faturalama süreçlerini dijitalleştirme ihtiyacından doğdu.

Bu proje ile amacım:

✔ Fatura girişlerini kolaylaştırmak
✔ Tahsilat & ödeme kayıtlarını tek noktadan yönetmek
✔ Müşteri ve malzeme hareketlerini şeffaf şekilde raporlayabilmek
✔ Son alış ve satış fiyatlarını hızlıca görebilmek
✔ Kullanıcı dostu bir arayüz ile süreçleri hızlandırmak

🏗 Kullanılan Teknolojiler
Backend

Java 17
Spring Boot
Spring Data JPA
Lombok
PostgresSQL
RESTful API mimarisi

Frontend

React.js
TailwindCSS

🔧 Öne Çıkan Özellikler
🧾 Fatura Yönetimi

Satın alma faturası ekleme / düzenleme / silme

Satış faturası ekleme / düzenleme / silme

Müşteri bakiyesi ile entegre çalışan faturalama sistemi

Şirketler arası kolay geçişle hızlı işlem yapılabilir.

💰 Tahsilat & Ödeme Takibi

Müşteriden alınan tahsilat kayıtları

Firmaya yapılan ödeme kayıtları

Müşteri bakiyesi ile otomatik ilişki

📦 Malzeme Yönetimi

Malzeme ekleme / düzenleme / silme

Malzemeye ait tüm fiyat geçmişi (alış / satış)

Son satın alma fiyatları listesi

Son satış fiyatları listesi


👥 Müşteri Yönetimi

Müşteri oluşturma, güncelleme, listeleme

Müşteriye özel bakiye takibi

Müşteriye bağlı fatura ve tahsilat geçmişleri


🖥 Arayüz Özellikleri
✔ Modern ve kullanıcı dostu arayüz

TailwindCSS ile temiz, sade ve hızlı bir arayüz.

✔ Modaller ile düzenleme ekranları

Fatura düzenleme, silme onayı vb. işlemler modern popup’larda yapılır.

✔ Gerçek zamanlı hesaplama

Kalem eklerken toplam tutar anlık güncellenir.

✔ Arama ve filtreleme

Fatura no, müşteri adı veya tarihe göre arama yapılabilir.
