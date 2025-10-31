package com.berksozcu.entites;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Satın Alma Faturası")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd.MM.yyyy")
    private LocalDate date;

    @Column(name = "Belge No")
    private String fileNo;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "Kdv Toplam")
    private BigDecimal kdvToplam;

    @Column(name = "Tutar")
    private BigDecimal totalPrice;



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
