export default function InvoiceViewModal({
  invoice,
  onClose,
  formatNumber,
  formatDate,
}) {
  if (!invoice) return null;

  const subTotal =
    Number(invoice?.totalPrice || 0) - Number(invoice.kdvToplam || 0);
  const taxTotal = Number(invoice.kdvToplam || 0);
  const grandTotal = Number(invoice.totalPrice || 0);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[1200px] max-h-[95vh] overflow-y-auto shadow-2xl relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-xl text-xl">👁️</span>
            Fatura Detayı
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-3xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Tarih
            </label>
            <div className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white font-medium">
              {formatDate(invoice?.date) || ""}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Belge No
            </label>
            <div className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-blue-400 font-mono font-bold">
              {invoice?.fileNo || ""}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Müşteri / Firma
            </label>
            <div className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white font-semibold">
              {invoice.customer?.name || ""}
            </div>
          </div>
        </div>

        {(invoice?.usdSellingRate > 0 || invoice?.eurSellingRate > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 bg-gray-800/30 rounded-3xl border border-gray-700/50">
            {invoice?.usdSellingRate > 0 && (
              <div className="flex items-center justify-between px-4">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  USD Satış Kuru
                </span>
                <span className="text-white font-mono font-bold">
                  $ {invoice?.usdSellingRate || 0}
                </span>
              </div>
            )}
            {invoice?.eurSellingRate > 0 && (
              <div className="flex items-center justify-between px-4 border-l border-gray-700/50">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">
                  EUR Satış Kuru
                </span>
                <span className="text-white font-mono font-bold">
                  € {invoice?.eurSellingRate || 0}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 overflow-hidden mb-8 shadow-inner">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-4 py-2">Malzeme</th>
                <th className="px-4 py-2 text-center">Miktar</th>
                <th className="px-4 py-2 text-center">Birim</th>
                <th className="px-4 py-2 text-right">Birim Fiyat</th>
                <th className="px-4 py-2 text-center">KDV %</th>
                <th className="px-4 py-2 text-right">Satır Toplamı</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(invoice.items) ? invoice.items : []).map(
                (item, i) => (
                  <tr key={i} className="bg-gray-800/50">
                    <td className="px-4 py-3 rounded-l-xl font-bold text-white">
                      {item.material?.comment || ""}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-300">
                      {formatNumber(item.quantity) || ""}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-900 px-3 py-1 rounded-lg text-blue-400 font-bold text-xs uppercase">
                        {item.unit || "ADET"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300 font-mono">
                      {formatNumber(item?.unitPrice) || ""} ₺
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">
                      %{item.kdv}
                    </td>
                    <td className="px-4 py-3 text-right rounded-r-xl font-mono font-bold text-blue-400">
                      {formatNumber(item?.lineTotal) || ""} ₺
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gray-900/60 p-8 rounded-[2.5rem] border border-gray-800 mb-8">
          <div className="text-gray-500 text-sm italic">
            * Bu fatura şu an sadece inceleme modundadır.
          </div>
          <div className="text-right min-w-[300px] space-y-3">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Ara Toplam:</span>
              <span className="font-mono text-white">
                {subTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-blue-400 text-sm font-semibold">
              <span>Hesaplanan KDV:</span>
              <span className="font-mono">
                +{" "}
                {taxTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-3 border-t border-gray-700 mt-2">
              <span className="text-white">Genel Toplam:</span>
              <span className="text-emerald-400">
                {grandTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full md:w-64 py-4 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all border border-gray-700 shadow-xl"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
