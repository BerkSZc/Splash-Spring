export default function CollectionViewModal({
  item,
  type,
  onClose,
  formatDate,
}) {
  if (!item) return null;

  const isReceived = type === "received";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span
              className={`p-2 rounded-xl text-xl ${isReceived ? "bg-emerald-600" : "bg-orange-600"}`}
            >
              {isReceived ? "⬇️" : "⬆️"}
            </span>
            İşlem Detayı
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-3xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Müşteri ve Tarih Kartı */}
          <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-800 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                  Tarih
                </label>
                <p className="text-lg font-mono text-white">
                  {formatDate(item?.date) || ""}
                </p>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                  İşlem No
                </label>
                <p className="text-lg font-mono text-blue-400 font-bold uppercase">
                  {item?.fileNo || "-"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/50">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Müşteri / Firma
              </label>
              <p className="text-xl font-bold text-white">
                {item.customer?.name || ""}
              </p>
            </div>
          </div>

          {/* Tutar Kartı */}
          <div
            className={`p-8 rounded-3xl border flex justify-between items-center ${
              isReceived
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-orange-500/5 border-orange-500/20"
            }`}
          >
            <span
              className={`font-bold uppercase text-xs tracking-[0.2em] ${isReceived ? "text-emerald-400" : "text-orange-400"}`}
            >
              {isReceived ? "Tahsilat Tutarı" : "Ödeme Tutarı"}
            </span>
            <span
              className={`text-3xl font-black font-mono ${isReceived ? "text-emerald-400" : "text-orange-400"}`}
            >
              {Number(item.price || 0).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ₺
            </span>
          </div>

          {/* Açıklama */}
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
              Açıklama / Not
            </label>
            <p className="text-gray-300 italic">
              {item.comment ? `"${item.comment}"` : "Açıklama girilmemiş."}
            </p>
          </div>
        </div>

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-all border border-gray-700 shadow-xl"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
