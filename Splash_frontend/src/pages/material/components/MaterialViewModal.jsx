export default function MaterialViewModal({ item, onClose }) {
  if (!item) return null;

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "₺";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-xl text-xl">🔍</span>
            Malzeme Detayı
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-3xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Ana Bilgiler Kartı */}
          <div className="grid grid-cols-2 gap-6 bg-gray-800/30 p-8 rounded-3xl border border-gray-800">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block">
                Malzeme Kodu
              </label>
              <p className="text-xl font-mono font-black text-white">
                {item?.code || ""}
              </p>
            </div>
            <div className="text-right">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block">
                Birim
              </label>
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-bold">
                {item?.unit || ""}
              </span>
            </div>
            <div className="col-span-2 pt-4 border-t border-gray-800/50">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block">
                Açıklama
              </label>
              <p className="text-lg text-gray-200 font-medium uppercase">
                {item?.comment || ""}
              </p>
            </div>
          </div>

          {/* Fiyat Bilgileri Kartı */}
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 block">
                Alış Fiyatı
              </label>
              <p className="text-2xl font-mono font-bold text-white">
                {Number(item.purchasePrice || 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="ml-2 text-blue-500">
                  {getCurrencySymbol(item?.purchaseCurrency) || ""}
                </span>
              </p>
            </div>
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-right">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 block">
                Satış Fiyatı
              </label>
              <p className="text-2xl font-mono font-bold text-white">
                {Number(item.salesPrice || 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="ml-2 text-emerald-500">
                  {getCurrencySymbol(item.salesCurrency) || ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alt Buton */}
        <div className="mt-10">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-all border border-gray-700 shadow-xl"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
