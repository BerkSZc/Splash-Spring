// Yazılcak faturanın Templati ayarlaması
// Yazılacak faturanın Templati ayarlaması
export const generateInvoiceHTML = (inv, invoiceType) => {
  // 1. ARA TOPLAM (MATRAH) HESAPLA: Sadece Fiyat * Miktar (Tutarlılık için kalemlerden hesaplanmaya devam ediyor)
  const araToplam = (inv?.items || []).reduce((acc, item) => {
    return acc + Number(item.unitPrice) * Number(item.quantity);
  }, 0);

  // 2. KDV MİKTARINI AL: Doğrudan inv nesnesinden alıyoruz
  const kdvMiktari = Number(inv?.kdvToplam || 0);

  // 3. GENEL TOPLAM: Hesaplanan matrah + gelen KDV miktarı
  const finalTotal = araToplam + kdvMiktari;

  // 4. TARİH FORMATI: ISO (YYYY-MM-DD) -> TR (DD.MM.YYYY)
  const formattedDate = inv?.date?.includes("-")
    ? inv.date.split("-").reverse().join(".")
    : inv?.date;

  return `
    <html>
      <head>
        <title>Fatura_${inv?.fileNo}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 5mm; }
            @page { size: A4; margin: 0; }
          }
          body { font-family: 'serif'; background: white; color: black; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="border-b-4 border-black pb-6 mb-8 flex justify-between items-center">
            <div>
              <h1 class="text-5xl font-black uppercase tracking-tighter">FATURA</h1>
              <p class="font-mono font-bold mt-2 text-xl tracking-tight">NO: ${
                inv?.fileNo
              }</p>
              <p class="italic text-sm">Tarih: ${formattedDate}</p>
            </div>
            <div class="text-right">
              <h2 class="text-3xl font-extrabold uppercase text-blue-900">ŞİRKET ADI</h2>
              <p class="text-xs uppercase tracking-widest mt-1 text-gray-600">ADRES BİLGİLERİ / VERGİ DAİRESİ<br>VERGİ NO: 0000000000</p>
            </div>
          </div>

          <div class="p-6 border-2 border-black rounded-3xl mb-12 w-2/3 shadow-sm">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b">Müşteri Bilgileri</h3>
            <p class="text-xl font-bold uppercase leading-tight">${
              inv?.customer?.name || ""
            }</p>
            <p class="text-sm text-gray-700 mt-1">${
              inv?.customer?.address || "Adres bilgisi yok."
            }</p>
            <p class="text-xs mt-2 font-mono bg-black text-white inline-block px-2 py-1 rounded">VN: ${
              inv?.customer?.vdNo || ""
            }</p>
          </div>

          <table class="w-full text-left border-collapse mb-10">
            <thead>
              <tr class="border-b-2 border-black text-[10px] font-black uppercase bg-gray-50">
                <th class="py-4 px-2">Açıklama</th>
                <th class="py-4 px-2 text-center">Miktar</th>
                <th class="py-4 px-2 text-right">Birim Fiyat</th>
                <th class="py-4 px-2 text-right">Toplam (KDV Hariç)</th>
              </tr>
            </thead>
            <tbody>
              ${inv?.items
                ?.map(
                  (item) => `
                <tr class="border-b border-gray-200">
                  <td class="py-4 px-2 font-bold text-sm">${
                    item?.material?.code
                  } - ${item?.material?.comment || ""}</td>
                  <td class="py-4 px-2 text-center font-mono">${
                    item?.quantity
                  }</td>
                  <td class="py-4 px-2 text-right font-mono">${Number(
                    item?.unitPrice
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                  <td class="py-4 px-2 text-right font-black text-sm">${(
                    Number(item?.unitPrice) * Number(item?.quantity)
                  ).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="flex justify-end pt-8">
            <div class="w-80 space-y-3">
              <div class="flex justify-between text-xs font-bold border-b pb-1 text-gray-500 uppercase tracking-tighter">
                <span>Ara Toplam (Matrah)</span>
                <span class="text-black font-mono">${araToplam.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 }
                )} ₺</span>
              </div>
              <div class="flex justify-between text-xs font-bold border-b pb-1 text-gray-500 uppercase tracking-tighter">
                <span>Toplam KDV</span>
                <span class="text-black font-mono">${kdvMiktari.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 }
                )} ₺</span>
              </div>
              <div class="flex justify-between text-3xl font-black bg-gray-100 p-4 rounded-2xl border-2 border-black">
                <span class="text-sm self-center uppercase tracking-tighter">Genel Toplam</span>
                <span class="font-mono">${finalTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })} ₺</span>
              </div>
            </div>
          </div>

          <div class="mt-24 flex justify-around opacity-40 grayscale">
            <div class="text-center">
              <div class="w-32 h-32 border border-gray-400 border-dashed rounded-full flex items-center justify-center font-bold text-[10px] uppercase text-gray-400">Kaşe / İmza</div>
              <p class="text-[10px] mt-2 font-bold">TESLİM EDEN</p>
            </div>
            <div class="text-center">
              <div class="w-32 h-32 border border-gray-400 border-dashed rounded-full flex items-center justify-center font-bold text-[10px] uppercase text-gray-400">İmza</div>
              <p class="text-[10px] mt-2 font-bold">TESLİM ALAN</p>
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
