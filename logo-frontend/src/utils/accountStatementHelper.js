export const accountStatementHelper = (
  selectedCustomer,
  sales,
  purchase,
  payments,
  collections,
  payrolls,
  year
) => {
  let combined = [];
  if (!selectedCustomer) return [];
  const targetId = Number(selectedCustomer.id);

  // 1. AÇILIŞ FİŞİ (Mevcut Bakiye)
  // undefined hatasını engellemek için year kontrolü
  const displayYear = year || new Date().getFullYear();
  if (
    selectedCustomer.openingBalance &&
    Number(selectedCustomer.openingBalance) !== 0
  ) {
    const openingBal = Number(selectedCustomer.openingBalance);
    combined.push({
      date: `01.01.${displayYear}`,
      desc: "Açılış Fişi",
      debit: openingBal > 0 ? openingBal : 0,
      credit: openingBal < 0 ? Math.abs(openingBal) : 0,
    });
  }

  // 2. Satış Faturaları (BORÇ)
  (sales || [])
    .filter((inv) => Number(inv.customer?.id) === targetId)
    .forEach((inv) => {
      combined.push({
        date: inv.date,
        desc: `Satış Faturası (No: ${inv.fileNo})`,
        debit: Number(inv.totalPrice || 0),
        credit: 0,
      });
    });

  // 3. Alınan Tahsilatlar (ALACAK)
  (collections || [])
    .filter((col) => Number(col.customer?.id) === targetId)
    .forEach((col) => {
      combined.push({
        date: col.date,
        desc: `${col.type || "Nakit"} Tahsilat (Fiş: ${col.id || ""})`,
        debit: 0,
        credit: Number(col.price || 0),
      });
    });

  // 4. ÇEK VE SENET (BORÇ / ALACAK Ayrımı)
  (Array.isArray(payrolls) ? payrolls : [])
    .filter((p) => Number(p.customer?.id) === targetId)
    .forEach((p) => {
      const typeLabel = p.payrollType === "CHEQUE" ? "Çek" : "Senet";
      const isInput = p.payrollModel === "INPUT";

      // Tarih formatını standartlaştır (Bazı veriler tireli gelebiliyor)
      const formattedDate =
        p.transactionDate && p.transactionDate.includes("-")
          ? p.transactionDate.split("-").reverse().join(".")
          : p.transactionDate;

      combined.push({
        date: formattedDate,
        desc: `${typeLabel} ${isInput ? "Girişi" : "Çıkışı"} (Vade: ${
          p.expiredDate
        } - No: ${p.fileNo})`,
        debit: isInput ? 0 : Number(p.amount || 0),
        credit: isInput ? Number(p.amount || 0) : 0,
      });
    });

  // 5. Satın Alma Faturaları (ALACAK)
  (purchase || [])
    .filter((inv) => Number(inv.customer?.id) === targetId)
    .forEach((inv) => {
      combined.push({
        date: inv.date,
        desc: `Alış Faturası (No: ${inv.fileNo})`,
        debit: 0,
        credit: Number(inv.totalPrice || 0),
      });
    });

  // 6. Yapılan Ödemeler (BORÇ)
  (payments || [])
    .filter((pay) => Number(pay.customer?.id) === targetId)
    .forEach((pay) => {
      combined.push({
        date: pay.date,
        desc: `${pay.type || "Banka"} Ödemesi`,
        debit: Number(pay.price || 0),
        credit: 0,
      });
    });

  // 7. Tarihe göre sırala (Esnek Sıralama Mantığı)
  combined.sort((a, b) => {
    const parseDate = (d) => {
      if (!d || typeof d !== "string") return new Date(0);
      // GG.AA.YYYY -> YYYY-MM-DD çevirir, tireliyse direkt kullanır
      const normalized = d.includes(".") ? d.split(".").reverse().join("-") : d;
      return new Date(normalized);
    };
    return parseDate(a.date) - parseDate(b.date);
  });

  // 8. Yürüyen Bakiye Hesapla
  let runningBalance = 0;
  return combined.map((item) => {
    runningBalance += (item.debit || 0) - (item.credit || 0);
    return { ...item, balance: runningBalance };
  });
};
