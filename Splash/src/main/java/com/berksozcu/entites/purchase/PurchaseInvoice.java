package com.berksozcu.entites.purchase;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.customer.Customer;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_invoice")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tarih
    private LocalDate date;

    //Belge No
    @Column(name = "file_no", unique = true)
    private String fileNo;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    // kdv fiyatlarının toplanmış hali
    @Column(name = "kdv_toplam", precision = 18, scale = 2)
    private BigDecimal kdvToplam;

    //KDV dahil net tutar
    @Column(name = "total_price", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "eur_selling_rate", precision = 18, scale = 4)
    private BigDecimal eurSellingRate;

    @Column(name = "usd_selling_rate", precision = 18, scale = 4)
    private BigDecimal usdSellingRate;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;


    //Burda mappdeBy Jpa tarafına çocuk görevi görür ve ilişkide etkisiz kalır.
    // Yazdığımız "purchaseInvoice" ise karşı class taki nesnenin ebeveyn olduğunu belirtir.

    //Cascade ise eğer ebeveyn de bir değişiklik yapılırsa childe onunla birlikte değiştirilcek demektir.
    //orphanRemoval ise eğer listeden bir kayıt silinirse bunu db den silmesi için kullanılır.

    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    // Bu anotasyon ilişkinin ebeveyn tarafını işaretler
    //Bu sınıfta PurchaseInvoiceItem sınıfını listli olduğu için ve
    // PurchaseInvoiceItem sınıfında bu sınıfın nesnesi olduğu için fatura oluşturmada
    //sonsuz döngüye girer bu anotasyon sayesinde bu engellenir.
    @JsonManagedReference
    private List<PurchaseInvoiceItem> items;
}
