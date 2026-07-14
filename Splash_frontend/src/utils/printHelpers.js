// Fatura yazdırma templatei
export const generateInvoiceHTML = (inv, invoiceType, voucher) => {
  const kdvToplam = Number(inv?.kdvToplam ?? 0);
  const totalPrice = Number(inv?.totalPrice ?? 0);
  const subTotal = totalPrice - kdvToplam || 0;

  const isPurchase = invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";
  const primaryColor = isPurchase ? "#111827" : "#1e3a8a";

  const currentBalance = Number(
    voucher?.finalBalance ?? inv?.customer?.finalBalance ?? 0,
  );

  const usdRate = Number(inv?.usdSellingRate ?? 0);
  const eurRate = Number(inv?.eurSellingRate ?? 0);

  const formattedDate = inv?.date?.includes("-")
    ? inv.date.split("-").reverse().join(".")
    : inv?.date;

  return `
  <!DOCTYPE html>
  <html>
      <head>
        <title>${typeTitle}_${inv?.fileNo || ""}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          @media print {
            body { margin: 0; padding: 0; background: white !important; }
            @page { size: A4; margin: 15mm; }
            .no-print { display: none; }
          }
          body { 
            font-family: 'Inter', sans-serif; 
            background: white !important; 
            color: #111827; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 10px;
          }
          .invoice-box { max-width: 800px; margin: auto; }
          
          /* 🎯 Tarayıcı Yazdırma Motorunu Zorlayan Saf CSS Düzenlemeleri */
          .flex-container { display: flex; justify-content: space-between; align-items: start; width: 100%; margin-bottom: 30px; }
          .flex-totals { display: flex; justify-content: space-between; align-items: stretch; width: 100%; margin-top: 24px; }
          
          .customer-card {
            border: 1px solid #e5e7eb;
            border-right: 4px solid ${primaryColor};
            background: #f9fafb !important;
            padding: 16px 20px;
            border-radius: 12px;
            text-align: right;
            width: 380px;
          }
          
          table.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
          table.invoice-table th { padding: 12px 8px; border-bottom: 2px solid #e5e7eb; background-color: #f3f4f6 !important; font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
          table.invoice-table td { padding: 12px 8px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
          
          .totals-box { min-width: 320px; margin-left: auto; }
          .total-row { display: flex; justify-content: space-between; font-size: 11px; color: #4b5563; padding: 4px 0; }
          .grand-total-box { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 16px; 
            border-radius: 12px; 
            border: 2px solid #111827; 
            background-color: #f9fafb !important;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          
          <!-- Üst Başlık ve Müşteri Kartı Alanı -->
          <div class="flex-container">
            <div style="flex: 1;">
               <div>
                  <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 0; line-height: 1.2;">
                    SÖZCÜ MATBAA <br> MALZEMELERİ LTD. ŞTİ.
                  </h2>
                  <p style="font-size: 10px; color: #6b7280; margin-top: 6px; line-height: 1.5; text-transform: uppercase;">
                    Himaye-i Etfal Sok. Aydoğmuş İş Hanı 7/1<br>
                    Cağaloğlu / İSTANBUL<br>
                    <span style="font-weight: 600; color: #111827;">VERGİ NO: 7800063113</span>
                  </p>
               </div>
               <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
                  <h1 style="font-size: 16px; font-weight: 700; color: ${primaryColor}; margin: 0; letter-spacing: -0.025em;">
                    ${typeTitle.toUpperCase()}
                  </h1>
                  <p style="font-size: 12px; font-family: monospace; color: #374151; margin: 2px 0 0 0;">NO: <b>${inv?.fileNo || ""}</b></p>
                  <p style="font-size: 11px; color: #6b7280; font-style: italic; margin: 2px 0 0 0;">Tarih: ${formattedDate || ""}</p>
               </div>
            </div>

            <div class="customer-card">
              <h3 style="font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;">FATURA EDİLEN MÜŞTERİ</h3>
              <p style="font-size: 15px; font-weight: 700; text-transform: uppercase; color: #111827; margin: 0 0 4px 0; line-height: 1.2;">${
                inv?.customer?.name || "—"
              }</p>
              <p style="font-size: 11px; color: #4b5563; margin: 0 0 12px auto; line-height: 1.4; max-width: 300px;">
                ${inv?.customer?.address || "Adres bilgisi mevcut değil."}
              </p>
              <span style="display: inline-block; padding: 2px 8px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 10px; font-weight: 600; font-family: monospace; color: #374151;">
                VD & NO: ${inv?.customer?.vdNo || "—"}
              </span>
            </div>
          </div>

          <!-- Malzeme Kalemleri Tablosu -->
          <table class="invoice-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 45%;">Açıklama / Ürün Kodu</th>
                <th style="text-align: center; width: 12%;">Miktar</th>
                <th style="text-align: right; width: 15%;">Birim Fiyat</th>
                <th style="text-align: right; width: 13%;">Kdv Tutarı</th>
                <th style="text-align: right; width: 15%;">Satır Toplam</th>
              </tr>
            </thead>
            <tbody style="color: #374151;">
              ${(Array.isArray(inv?.items) ? inv.items : [])
                ?.map(
                  (item) => `
                <tr>
                  <td style="text-align: left; font-weight: 600; color: #111827;">
                    ${item?.material?.comment || ""}
                  </td>
                  <td style="text-align: center; font-family: monospace; color: #4b5563;">
                    ${item?.quantity ?? 0} <span style="font-size: 9px; font-weight: 700; color: #9ca3af; margin-left: 2px;">${item?.unit || ""}</span>
                  </td>
                  <td style="text-align: right; font-family: monospace; color: #4b5563;">${Number(
                    item?.unitPrice ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td style="text-align: right; font-family: monospace; color: #6b7280;">${Number(
                    item?.kdvTutar ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td style="text-align: right; font-weight: 700; color: #111827;">${Number(
                    item?.lineTotal ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                </tr>
              `,
                )
                ?.join("")}
            </tbody>
          </table>

          <!-- Alt Toplamlar Matrisi -->
          <div class="flex-totals">
            <div style="flex: 1;"></div>
            <div class="totals-box">
              <div class="total-row">
                <span>ARA TOPLAM (MATRAH)</span>
                <span style="font-family: monospace; font-weight: 600; color: #1f2937;">${subTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div class="total-row" style="border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 4px;">
                <span>TOPLAM KDV</span>
                <span style="font-family: monospace; font-weight: 600; color: #1f2937;">${kdvToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
              </div>
              <div class="grand-total-box">
                <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: #4b5563;">GENEL TOPLAM</span>
                <span style="font-size: 18px; font-weight: 800; color: ${primaryColor};">
                  ${totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>

          <!-- Cari Hesap Bakiyesi Bilgilendirmesi -->
          <div style="margin-top: 32px; padding: 16px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
            <h4 style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0;">Genel Açıklamalar</h4>
            <p style="font-size: 12px; color: #111827; font-weight: 700; text-transform: uppercase; margin: 0; tracking: 0.025em;">
              Son Cari Hesap Bakiyesi: 
              <span style="font-size: 13px; font-weight: 800; font-family: monospace; padding: 2px 8px; background-color: #fef08a; border-radius: 6px; border: 1px solid #fef08a; margin: 0 4px;">
                ${currentBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </span> 
              Dir.
            </p>
          </div>

          <!-- Banka Bilgileri -->
          <div style="margin-top: 24px;">
            <table style="width: 100%; text-align: left; font-size: 12px; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <th style="padding-bottom: 6px; width: 33%; font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase;">BANKA ADI</th>
                  <th style="padding-bottom: 6px; font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; font-family: monospace;">İBAN NO</th>
                </tr>
              </thead>
              <tbody style="color: #1f2937; font-weight: 500;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #111827;">Enpara Bank</td>
                  <td style="padding: 8px 0; font-family: monospace; letter-spacing: 0.02em; color: #374151;">TR10 0015 7000 0000 0098 6528 18</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #111827;">Denizbank Cağaloğlu Şb.</td>
                  <td style="padding: 8px 0; font-family: monospace; letter-spacing: 0.02em; color: #374151;">TR88 0013 4000 0018 5773 3000 10</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Döviz Kurları Notu -->
          <div style="margin-top: 16px; font-size: 10px; color: #6b7280; font-family: monospace;">
            <span style="font-weight: 700; color: #374151;">Ödeme Notu:</span> 
            EURO: <span style="font-weight: 700; color: #111827; margin-right: 16px;">${eurRate > 0 ? eurRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
            DOLAR: <span style="font-weight: 700; color: #111827;">${usdRate > 0 ? usdRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 300);
          };
        </script>
      </body>
    </html>
  `;
};
