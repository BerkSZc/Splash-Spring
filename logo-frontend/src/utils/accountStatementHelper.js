export const accountStatementHelper = (
  selectedCustomer,
  sales,
  purchase,
  payments,
  collections,
  year
) => {
  let combined = [];
  const targetId = Number(selectedCustomer.id);

  // 1. AÇILIŞ FİŞİ (Mevcut Bakiye)
  if (selectedCustomer.balance && Number(selectedCustomer.balance) !== 0) {
    const bal = Number(selectedCustomer.balance);
    combined.push({
      date: `01.01.${year}`,
      desc: "Açılış Fişi",
      debit: bal > 0 ? bal : 0,
      credit: bal < 0 ? Math.abs(bal) : 0,
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

  // 3. Alınan Tahsilatlar (ALACAK) - 'price' kullanıldı
  (collections || [])
    .filter((col) => Number(col.customer?.id) === targetId)
    .forEach((col) => {
      combined.push({
        date: col.date,
        desc: `${col.type || "Nakit"} Tahsilat (Fiş: ${col.id || ""})`,
        debit: 0,
        credit: Number(col.price || 0), // Burası 'price' olarak düzeltildi
      });
    });

  // 4. Satın Alma Faturaları (ALACAK)
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

  // 5. Yapılan Ödemeler (BORÇ) - 'price' kullanıldı
  (payments || [])
    .filter((pay) => Number(pay.customer?.id) === targetId)
    .forEach((pay) => {
      combined.push({
        date: pay.date,
        desc: `${pay.type || "Banka"} Ödemesi`,
        debit: Number(pay.price || 0), // Burası 'price' olarak düzeltildi
        credit: 0,
      });
    });

  // Tarihe göre sırala
  combined.sort((a, b) => {
    const dateA = a.date.split(".").reverse().join("-");
    const dateB = b.date.split(".").reverse().join("-");
    return new Date(dateA) - new Date(dateB);
  });

  // Yürüyen Bakiye Hesapla
  let runningBalance = 0;
  return combined.map((item) => {
    runningBalance += item.debit - item.credit;
    return { ...item, balance: runningBalance };
  });
};
