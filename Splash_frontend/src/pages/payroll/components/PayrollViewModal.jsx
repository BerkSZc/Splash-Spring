export default function PayrollViewModal({
  item,
  onClose,
  currentTheme,
  formatDate,
}) {
  if (!item) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span
              className={`p-2 rounded-xl text-xl ${currentTheme.bg} bg-opacity-20 ${currentTheme.color}`}
            >
              {currentTheme.icon}
            </span>
            Evrak Detayı
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-3xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Tarih ve Seri No Kartı */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 p-6 rounded-3xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                İşlem Tarihi
              </label>
              <p className="text-lg font-mono text-white">
                {formatDate(item.transactionDate) || ""}
              </p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-3xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Seri / Dosya No
              </label>
              <p
                className={`text-lg font-mono font-bold uppercase ${currentTheme.color}`}
              >
                {item?.fileNo || ""}
              </p>
            </div>
          </div>

          {/* Müşteri ve Vade Kartı */}
          <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-800 space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Müşteri / Cari
              </label>
              <p className="text-xl font-bold text-white">
                {item.customer?.name || ""}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800/50 flex justify-between items-center">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                  Vade Tarihi
                </label>
                <span className="bg-orange-500/10 text-orange-400 px-4 py-1 rounded-full text-md font-bold font-mono">
                  {formatDate(item.expiredDate) || ""}
                </span>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                  Banka / Şube
                </label>
                <p className="text-white font-semibold">
                  {item.bankName || "Belirtilmemiş"}
                </p>
                <p className="text-xs text-gray-500">{item.bankBranch}</p>
              </div>
            </div>
          </div>

          {/* Tutar Kartı */}
          <div
            className={`p-8 rounded-3xl border flex justify-between items-center bg-opacity-5 border-opacity-20`}
          >
            <span className="font-bold uppercase text-xs tracking-[0.2em] text-gray-400">
              Evrak Tutarı
            </span>
            <span
              className={`text-4xl font-black font-mono ${currentTheme.color}`}
            >
              {Number(item.amount || 0).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ₺
            </span>
          </div>

          {/* Açıklama */}
          {item.comment && (
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Notlar
              </label>
              <p className="text-gray-300 italic">"{item?.comment || ""}"</p>
            </div>
          )}
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
