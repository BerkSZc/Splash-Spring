//Fatura yazdırma templatei
export const generateInvoiceHTML = (inv, invoiceType, voucher) => {
  const kdvToplam = Number(inv?.kdvToplam || 0);
  const totalPrice = Number(inv?.totalPrice || 0);
  const subTotal = totalPrice - kdvToplam || 0;

  const isPurchase = invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";
  const primaryColor = isPurchase ? "" : "#1e3a8a";

  const currentBalance = voucher.finalBalance;
  const usdRate = Number(inv?.usdSellingRate || 0);
  const eurRate = Number(inv?.eurSellingRate || 0);

  const formattedDate = inv?.date?.includes("-")
    ? inv.date.split("-").reverse().join(".")
    : inv?.date;

  return `
  <html>
      <head>
        <title>${typeTitle}_${inv?.fileNo}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          @media print {
            body { margin: 0; padding: 0; }
            @page { size: A4; margin: 12mm; }
          }
          body { 
            font-family: 'Inter', sans-serif; 
            background: white; 
            color: #111827; 
            -webkit-print-color-adjust: exact;
          }
          .invoice-box { max-width: 800px; margin: auto; padding: 10px; }
          
          .customer-card {
            border-right: 3px solid ${primaryColor};
            background: #f9fafb;
            padding: 16px 20px;
            border-radius: 12px 0 0 12px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          
          <div class="flex justify-between items-start mb-12">
            <div class="space-y-4">
               <div>
                  <h2 class="text-lg font-extrabold text-blue-900 leading-tight">
                    SÖZCÜ MATBAA <br> MALZEMELERİ LTD. ŞTİ.
                  </h2>
                  <p class="text-[10px] text-gray-500 mt-1 leading-relaxed uppercase">
                    Himaye-i Etfal Sok. Aydoğmuş İş Hanı 7/1<br>
                    Cağaloğlu / İSTANBUL<br>
                    <span class="font-semibold text-gray-900">VERGİ NO: 7800063113</span>
                  </p>
               </div>
               <div class="pt-3 border-t border-gray-100">
                  <h1 class="text-base font-bold tracking-tight" style="color: ${primaryColor}">
                    ${typeTitle.toUpperCase()}
                  </h1>
                  <p class="text-xs font-mono mt-0.5 text-gray-700">NO: <b>${
                    inv?.fileNo
                  }</b></p>
                  <p class="text-[10px] text-gray-500 italic">Tarih: ${formattedDate}</p>
               </div>
            </div>

            <div class="customer-card w-full max-w-[380px] border border-gray-100 border-r-0">
              <h3 class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">FATURA EDİLEN MÜŞTERİ</h3>
              <p class="text-base font-bold uppercase mb-1 text-gray-900 leading-tight">${
                inv?.customer?.name || "—"
              }</p>
              <p class="text-[11px] text-gray-600 mb-3 leading-snug ml-auto max-w-[280px]">
                ${inv?.customer?.address || "Adres bilgisi mevcut değil."}
              </p>
              <span class="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold font-mono text-gray-600">
                VD & NO: ${inv?.customer?.vdNo || "—"}
              </span>
            </div>
          </div>

          <table class="w-full text-left mb-8">
            <thead>
              <tr class="text-[9px] font-bold uppercase text-gray-400 border-b border-gray-200">
                <th class="py-3 px-2">Açıklama / Ürün Kodu</th>
                <th class="py-3 px-2 text-center">Miktar</th>
                <th class="py-3 px-2 text-right">Birim Fiyat</th>
                <th class="py-3 px-2 text-right">Kdv Tutarı</th>
                <th class="py-3 px-2 text-right">Satır Toplam</th>
              </tr>
            </thead>
            <tbody class="text-[11px] divide-y divide-gray-50">
              ${inv?.items
                ?.map(
                  (item) => `
                <tr>
                  <td class="py-3 px-2">
                    <div class="font-semibold text-gray-900">${
                      item?.material?.code
                    }</div>
                    <div class="text-[10px] text-gray-400 mt-0.5 italic">${
                      item?.material?.comment || ""
                    }</div>
                  </td>
                  <td class="py-3 px-2 text-center font-mono text-gray-600">${
                    item?.quantity
                  }</td>
                  <td class="py-3 px-2 text-right font-mono text-gray-600">${Number(
                    item?.unitPrice,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td class="py-3 px-2 text-right font-mono text-gray-500">${Number(
                    item?.kdvTutar || 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td class="py-3 px-2 text-right font-bold text-gray-900">${Number(
                    item.lineTotal,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="grid grid-cols-2 gap-10 items-end">
            <div class="space-y-6 pb-2">
              <div class="flex gap-6 border-l-2 border-gray-100 pl-3">
                ${
                  usdRate > 0
                    ? `
                  <div>
                    <p class="text-[8px] font-bold text-gray-400 uppercase">USD KURU</p>
                    <p class="text-xs font-mono font-bold">${usdRate.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 4 },
                    )} ₺</p>
                  </div>
                `
                    : ""
                }
                ${
                  eurRate > 0
                    ? `
                  <div>
                    <p class="text-[8px] font-bold text-gray-400 uppercase">EUR KURU</p>
                    <p class="text-xs font-mono font-bold">${eurRate.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 4 },
                    )} ₺</p>
                  </div>
                `
                    : ""
                }
              </div>

              <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit min-w-[180px]">
                <p class="text-[8px] font-bold text-gray-400 uppercase mb-0.5 tracking-wider">GÜNCEL TOPLAM BAKİYE</p>
                <p class="text-lg font-bold text-gray-900 font-mono">
                   ${currentBalance?.toLocaleString("tr-TR", {
                     minimumFractionDigits: 2,
                   })} ₺
                </p>
              </div>
            </div>

            <div class="space-y-2 bg-white">
              <div class="flex justify-between text-[10px] text-gray-500 font-medium px-1">
                <span>ARA TOPLAM (MATRAH)</span>
                <span class="font-mono text-gray-800">${subTotal.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 },
                )} ₺</span>
              </div>
              <div class="flex justify-between text-[10px] text-gray-500 font-medium px-1 pb-1">
                <span>TOPLAM KDV</span>
                <span class="font-mono text-gray-800">${kdvToplam.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 },
                )} ₺</span>
              </div>
              <div class="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-50/30">
                <span class="text-[10px] font-bold uppercase tracking-tight text-gray-600">GENEL TOPLAM</span>
                <span class="text-xl font-extrabold tracking-tight" style="color: ${primaryColor}">
                  ${totalPrice.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺
                </span>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 500);
          };
        </script>
      </body>
    </html>
  `;
};
