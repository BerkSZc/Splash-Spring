//Fatura yazdırma templatei
export const generateInvoiceHTML = (inv, invoiceType, voucher) => {
  const kdvToplam = Number(inv?.kdvToplam ?? 0);
  const totalPrice = Number(inv?.totalPrice ?? 0);
  const subTotal = totalPrice - kdvToplam || 0;

  const isPurchase = invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";
  const primaryColor = isPurchase ? "" : "#1e3a8a";

  const currentBalance = voucher?.finalBalance ?? 0;
  const usdRate = Number(inv?.usdSellingRate ?? 0);
  const eurRate = Number(inv?.eurSellingRate ?? 0);

  const formattedDate = inv?.date?.includes("-")
    ? inv.date.split("-").reverse().join(".")
    : inv?.date;

  return `
  <html>
      <head>
        <title>${typeTitle}_${inv?.fileNo || ""}</title>
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
              ${(Array.isArray(inv.items) ? inv?.items : [])
                ?.map(
                  (item) => `
                <tr>
                  <td class="py-3 px-2">
                    <div class="font-semibold text-gray-900">${
                      item?.material?.comment || ""
                    }</div>
                  </td>
                 <td class="py-3 px-2 text-center font-mono text-gray-600">
                    ${item?.quantity ?? 0} 
                    <span class="text-[9px] font-bold text-gray-400 ml-0.5">
                      ${item?.unit || ""}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right font-mono text-gray-600">${Number(
                    item?.unitPrice ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 4,
                  })} ₺</td>
                  <td class="py-3 px-2 text-right font-mono text-gray-500">${Number(
                    item?.kdvTutar ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td class="py-3 px-2 text-right font-bold text-gray-900">${Number(
                    item.lineTotal ?? 0,
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="flex justify-between items-stretch gap-10 mt-6 mb-8 bg-white">
            <div class="flex flex-col justify-between space-y-4">
              <div class="mt-auto"></div>
            </div>

            <div class="space-y-2 bg-white min-w-[300px]">
              <div class="flex justify-between text-[10px] text-gray-500 font-medium px-1 gap-12">
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
                <span class="text-[10px] font-bold uppercase tracking-tight text-gray-600 mr-8">GENEL TOPLAM</span>
                <span class="text-xl font-extrabold tracking-tight" style="color: ${primaryColor}">
                  ${totalPrice.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺
                </span>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 space-y-6">
            
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Genel Açıklamalar</h4>
              <p class="text-xs text-gray-900 font-bold uppercase tracking-wide">
                Son Cari Hesap Bakiyesi: 
                <span class="text-sm font-extrabold text-black font-mono px-2 py-0.5 bg-yellow-100 rounded border border-yellow-200">
                  ${currentBalance?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </span> 
                Dir.
              </p>
            </div>

            <div>
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-[9px] font-bold uppercase text-gray-400 border-b border-gray-100">
                    <th class="pb-2 w-1/3">BANKA ADI</th>
                    <th class="pb-2 font-mono">İBAN NO</th>
                  </tr>
                </thead>
                <tbody class="text-gray-800 divide-y divide-gray-50 font-medium">
                  <tr>
                    <td class="py-2 text-gray-900 font-semibold">Enpara Bank</td>
                    <td class="py-2 font-mono tracking-wide text-gray-700">TR10 0015 7000 0000 0098 6528 18</td>
                  </tr>
                  <tr>
                    <td class="py-2 text-gray-900 font-semibold">Denizbank Cağaloğlu Şb.</td>
                    <td class="py-2 font-mono tracking-wide text-gray-700">TR88 0013 4000 0018 5773 3000 10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-between items-center text-[10px] bg-white pt-2">
              <div class="text-gray-500 font-mono">
                <span class="font-bold text-gray-700">Ödeme Notu:</span> 
                EURO: <span class="font-bold text-gray-900 mr-4">${eurRate > 0 ? eurRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
                DOLAR: <span class="font-bold text-gray-900">${usdRate > 0 ? usdRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
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
