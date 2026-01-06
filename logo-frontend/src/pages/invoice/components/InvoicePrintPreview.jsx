export default function InvoicePrintPreview({
  printItem,
  onCancel,
  onExecutePrint,
}) {
  if (!printItem) return null;

  const araToplam = (printItem.items || []).reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const genelToplam = araToplam + (printItem.kdvToplam || 0);

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] backdrop-blur-sm p-4 md:p-10">
      <div className="bg-[#1a1f2e] border border-gray-800 w-full max-w-5xl max-h-[95vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                👁️
              </span>
              Fatura Önizleme
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {printItem.fileNo} numaralı belge kontrol ediliyor
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
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-800/30 flex justify-center">
          <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl text-black font-serif origin-top transform scale-[0.85] md:scale-100">
            <div className="border-b-4 border-black pb-4 mb-8 flex justify-between">
              <div>
                <h1 className="text-4xl font-black uppercase italic">FATURA</h1>
                <p className="font-mono font-bold text-lg">
                  NO: {printItem.fileNo}
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold uppercase">ŞİRKET ADI</h2>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-tight">
                  Adres Bilgileri / Vergi Dairesi
                  <br />
                  Vergi No: 0000000000
                </p>
              </div>
            </div>
            <div className="p-4 border-2 border-black rounded-2xl mb-8 w-2/3">
              <h3 className="text-[9px] font-bold text-gray-400 uppercase border-b mb-1">
                Müşteri
              </h3>
              <p className="font-bold uppercase text-lg leading-tight">
                {printItem.customer?.name}
              </p>
              <p className="text-xs mt-1">{printItem.customer?.address}</p>
            </div>
            <table className="w-full text-left text-sm mb-10">
              <thead>
                <tr className="border-b-2 border-black font-bold text-[10px] uppercase bg-gray-50">
                  <th className="py-2 px-1">Açıklama</th>
                  <th className="py-2 px-1 text-center">Miktar</th>
                  <th className="py-2 px-1 text-right">Fiyat</th>
                  <th className="py-2 px-1 text-right">KDV Tutarı</th>
                  <th className="py-2 px-1 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {printItem.items?.map((item, idx) => {
                  const net = item.unitPrice * item.quantity;
                  const kdv = (net * (item.kdv || 20)) / 100;
                  return (
                    <tr key={idx}>
                      <td className="py-3 px-1 font-bold text-xs">
                        {item.material?.code} - {item.material?.comment}
                      </td>
                      <td className="py-3 px-1 text-center font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-1 text-right font-mono">
                        {item.unitPrice.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3 px-1 text-right font-mono text-[10px] text-gray-500 italic">
                        {kdv.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </td>
                      <td className="py-3 px-1 text-right font-black text-xs">
                        {net.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 space-y-1">
                <div className="flex justify-between text-[11px] border-b pb-1">
                  <span className="text-gray-500 font-bold uppercase">
                    Ara Toplam:
                  </span>
                  <span className="font-mono text-black">
                    {araToplam.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between text-[11px] border-b pb-1">
                  <span className="text-gray-500 font-bold uppercase">
                    KDV Toplam:
                  </span>
                  <span className="font-mono text-black">
                    {(printItem.kdvToplam || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black pt-2 border-t-2 border-black mt-2">
                  <span className="text-[10px] self-center uppercase">
                    Genel Toplam:
                  </span>
                  <span className="text-black">
                    {genelToplam.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
