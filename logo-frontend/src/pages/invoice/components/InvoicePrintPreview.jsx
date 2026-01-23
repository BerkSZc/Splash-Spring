export default function InvoicePrintPreview({
  printItem,
  onCancel,
  onExecutePrint,
}) {
  if (!printItem) return null;

  const kdvToplam = Number(printItem.kdvToplam || 0);
  const totalPrice = Number(printItem.totalPrice || 0);
  const subTotal = totalPrice - kdvToplam;

  const currentBalance = Number(printItem?.customer?.yearlyBalance || 0);
  const usdRate = Number(printItem?.usdSellingRate || 0);
  const eurRate = Number(printItem?.eurSellingRate || 0);

  const isPurchase = printItem?.invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";
  const typeBadgeColor = isPurchase
    ? "bg-amber-100 text-amber-800"
    : "bg-blue-100 text-blue-800";
  const primaryColor = isPurchase ? "#92400e" : "#1e3a8a";

  const formattedDate = printItem?.date?.includes("-")
    ? printItem.date.split("-").reverse().join(".")
    : printItem?.date;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] backdrop-blur-sm p-4 md:p-10 text-left">
      <div className="bg-[#1a1f2e] border border-gray-800 w-full max-w-5xl max-h-[95vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        {/* Header - Kontrol Paneli */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="text-left">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                👁️
              </span>
              Fatura Önizleme
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {printItem.fileNo} numaralı belge yazdırılmaya hazır
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-bold hover:bg-gray-700 transition"
            >
              Vazgeç
            </button>
            <button
              onClick={() => onExecutePrint(printItem)}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg flex items-center gap-2"
            >
              <span>🖨️</span> Şimdi Yazdır
            </button>
          </div>
        </div>

        {/* Önizleme Alanı */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-800/30 flex justify-center">
          <div className="bg-white w-[210mm] min-h-[297mm] p-[12mm] shadow-2xl text-black font-sans origin-top transform scale-[0.8] md:scale-100">
            {/* Şirket Header - Fontlar Küçültüldü */}
            <div className="border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-start">
              <div className="flex flex-col gap-2 text-left">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${typeBadgeColor} w-fit`}
                >
                  {typeTitle}
                </span>
                <p className="font-mono font-bold text-lg tracking-tight leading-none mt-1">
                  NO: {printItem?.fileNo}
                </p>
                <p className="italic text-[11px] text-gray-600">
                  Tarih: {formattedDate}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <h2 className="text-lg font-extrabold uppercase text-blue-900 leading-tight max-w-[250px]">
                  SÖZCÜ MATBAA MALZEMELERİ LTD. ŞTİ.
                </h2>
                <div className="h-[2px] w-16 bg-blue-900 my-2"></div>
                <p className="text-[10px] uppercase tracking-tight text-gray-500 leading-relaxed max-w-[200px]">
                  Himaye-i Etfal Sok. <br />
                  Aydoğmuş İş Hanı 7/1 <br />
                  Cağaloğlu / İSTANBUL
                </p>
                <p className="text-[10px] font-bold mt-1 text-black bg-gray-100 px-2 py-0.5 rounded">
                  VERGİ NO: 7800063113
                </p>
              </div>
            </div>

            {/* Müşteri Bilgileri - Fontlar Dengelendi */}
            <div className="p-5 border border-gray-200 bg-gray-50/50 rounded-xl mb-10 w-2/3 text-left">
              <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b">
                Müşteri Bilgileri
              </h3>
              <p className="text-base font-bold uppercase leading-tight text-gray-900">
                {printItem?.customer?.name || ""}
              </p>
              <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                {printItem?.customer?.address || "Adres bilgisi yok."}
              </p>
              <p className="text-[10px] mt-2 font-mono bg-gray-800 text-white inline-block px-2 py-0.5 rounded">
                VN: {printItem?.customer?.vdNo || ""}
              </p>
            </div>

            {/* Kalemler Tablosu - Fontlar Küçültüldü */}
            <table className="w-full text-left border-collapse mb-10">
              <thead>
                <tr className="border-b border-gray-300 text-[9px] font-bold uppercase text-gray-400 bg-gray-50/50">
                  <th className="py-3 px-2">Malzeme</th>
                  <th className="py-3 px-2 text-center">Miktar</th>
                  <th className="py-3 px-2 text-right">Birim Fiyat</th>
                  <th className="py-3 px-2 text-right">KDV Tutarı</th>
                  <th className="py-3 px-2 text-right">Satır Toplam</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {printItem?.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-gray-900">
                        {item?.material?.code}
                      </div>
                      <div className="text-[10px] text-gray-400 italic">
                        {item?.material?.comment || ""}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-gray-600">
                      {item?.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-600">
                      {Number(item?.unitPrice).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-gray-400 italic">
                      {Number(item?.kdvTutar || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-gray-900">
                      {Number(
                        item?.lineTotal || item.unitPrice * item.quantity,
                      ).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Alt Bilgiler: Döviz ve Toplamlar */}
            <div className="flex justify-between items-start pt-4">
              <div className="w-1/3 p-3 border border-gray-100 rounded-xl bg-gray-50/30 text-left">
                <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b">
                  Günlük Döviz Kurları
                </h4>
                <div className="space-y-1 font-mono text-[10px]">
                  {usdRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">USD:</span>
                      <span className="font-bold">
                        {usdRate.toLocaleString("tr-TR", {
                          minimumFractionDigits: 4,
                        })}{" "}
                        ₺
                      </span>
                    </div>
                  )}
                  {eurRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">EUR:</span>
                      <span className="font-bold">
                        {eurRate.toLocaleString("tr-TR", {
                          minimumFractionDigits: 4,
                        })}{" "}
                        ₺
                      </span>
                    </div>
                  )}
                  {usdRate === 0 && eurRate === 0 && (
                    <span className="italic text-gray-400 text-[9px]">
                      Kur bilgisi bulunamadı.
                    </span>
                  )}
                </div>
              </div>

              <div className="w-72 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-500 font-medium px-1">
                  <span>ARA TOPLAM (MATRAH)</span>
                  <span className="font-mono text-gray-800">
                    {subTotal.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium px-1 border-b border-gray-100 pb-1">
                  <span>TOPLAM KDV</span>
                  <span className="font-mono text-gray-800">
                    {kdvToplam.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    Genel Toplam
                  </span>
                  <span
                    className="text-xl font-extrabold tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    {totalPrice.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
              </div>
            </div>

            {/* Bakiye Bilgisi */}
            <div className="mt-8 flex justify-end">
              <div className="p-3 border border-emerald-200 rounded-xl w-fit min-w-[200px] bg-emerald-50/20 text-right">
                <h3 className="text-[8px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">
                  {printItem?.date?.split("-")[0]} Yılı Dönem Bakiyesi
                </h3>
                <p className="text-lg font-bold text-emerald-900 font-mono">
                  {currentBalance.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ₺
                </p>
                <p className="text-[8px] text-emerald-600 italic font-medium">
                  * Fatura tarihi itibarıyla mühürlenmiş bakiye.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
