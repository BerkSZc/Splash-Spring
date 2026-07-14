// Hesap ekstresi için fonksiyonlar

export const accountStatementHelper = (
  selectedCustomer,
  sales,
  purchase,
  payments,
  collections,
  payrolls,
  year,
  customerVoucher,
) => {
  let combined = [];
  if (!selectedCustomer) return [];
  const targetId = Number(selectedCustomer.id);
  const selectedYear = Number(year);

  const isCorrectYear = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString).getFullYear() === selectedYear;
  };

  const formatDateToTR = (dateString) => {
    if (!dateString || typeof dateString !== "string") return dateString;
    if (dateString.includes(".")) return dateString;

    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  };

  const displayYear = year || new Date().getFullYear();
  if (selectedCustomer) {
    const yearlyDebit = Number(
      selectedCustomer?.yearlyDebit ??
        selectedCustomer?.openingVoucher?.yearlyDebit ??
        customerVoucher?.yearlyDebit ??
        0,
    );

    const yearlyCredit = Number(
      selectedCustomer?.yearlyCredit ??
        selectedCustomer?.openingVoucher?.yearlyCredit ??
        customerVoucher?.yearlyCredit ??
        0,
    );

    const openingBal = yearlyDebit - yearlyCredit;

    combined.push({
      date: `${displayYear}-01-01`,
      desc: "Açılış Fişi",
      debit: openingBal > 0 ? openingBal : 0,
      credit: openingBal < 0 ? Math.abs(openingBal) : 0,
    });
  }

  // 2. Satış Faturaları (BORÇ)
  (sales || [])
    .filter(
      (inv) => Number(inv.customer?.id) === targetId && isCorrectYear(inv.date),
    )
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
    .filter(
      (col) => Number(col.customer?.id) === targetId && isCorrectYear(col.date),
    )
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
    .filter(
      (p) =>
        Number(p.customer?.id) === targetId && isCorrectYear(p.transactionDate),
    )
    .forEach((p) => {
      const typeLabel = p.payrollType === "CHEQUE" ? "Çek" : "Senet";
      const isInput = p.payrollModel === "INPUT";

      combined.push({
        date: p.transactionDate,
        desc: `${typeLabel} ${isInput ? "Girişi" : "Çıkışı"} (Vade: ${formatDateToTR(
          p.expiredDate,
        )} - No: ${p.fileNo})`,
        debit: isInput ? 0 : Number(p.amount || 0),
        credit: isInput ? Number(p.amount || 0) : 0,
      });
    });

  // 5. Satın Alma Faturaları (ALACAK)
  (purchase || [])
    .filter(
      (inv) => Number(inv.customer?.id) === targetId && isCorrectYear(inv.date),
    )
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
    .filter(
      (pay) => Number(pay.customer?.id) === targetId && isCorrectYear(pay.date),
    )
    .forEach((pay) => {
      combined.push({
        date: pay.date,
        desc: `${pay.type || "Banka"} Ödemesi`,
        debit: Number(pay.price || 0),
        credit: 0,
      });
    });

  // 7. Tarihe göre sırala
  combined.sort((a, b) => {
    const parseDate = (d) => {
      if (!d || typeof d !== "string") return new Date(0);
      const normalized = d.includes(".") ? d.split(".").reverse().join("-") : d;
      return new Date(normalized);
    };
    return parseDate(a.date) - parseDate(b.date);
  });

  // 8. Yürüyen Bakiye Hesapla
  let runningBalance = 0;
  return (Array.isArray(combined) ? combined : []).map((item) => {
    runningBalance += (item.debit || 0) - (item.credit || 0);
    return {
      ...item,
      date: formatDateToTR(item.date), // Kullanıcı arayüzünde görülecek TR formatlama burada tek elden yapılıyor
      balance: runningBalance,
    };
  });
};
