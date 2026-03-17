export default function ClientViewModal({
  customer,
  onClose,
  vouchers,
  formatNumber,
}) {
  if (!customer) return null;

  const customerVoucher = (Array.isArray(vouchers) ? vouchers : [])?.find(
    (v) => v?.customer?.id === customer.id,
  );
  const balance = Number(customerVoucher?.finalBalance || 0);
  const isDebtor = balance > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-lg">👤</span>
            Müşteri Detayı
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-800 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                    Müşteri Kodu
                  </label>
                  <p className="text-md font-mono text-blue-400 font-bold uppercase">
                    {customer?.code || ""}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${customer.archived ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}
                >
                  {customer?.archived ? "ARŞİVDE" : "AKTİF"}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                  Firma / Müşteri Adı
                </label>
                <p className="text-xl font-bold text-white truncate">
                  {customer?.name || ""}
                </p>
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border flex flex-col justify-center ${isDebtor ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}
            >
              <span className="font-bold uppercase text-[10px] tracking-[0.2em] text-gray-400 block mb-1">
                Güncel Bakiye
              </span>
              <div className="flex justify-between items-end">
                <span
                  className={`text-xs font-bold ${isDebtor ? "text-red-400" : "text-emerald-400"}`}
                >
                  {isDebtor ? "🔴 SİZE BORÇLU" : "🟢 SİZDEN ALACAKLI"}
                </span>
                <span
                  className={`text-3xl font-black font-mono ${isDebtor ? "text-red-400" : "text-emerald-400"}`}
                >
                  {formatNumber(Math.abs(balance)) || ""} ₺
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Vergi No / TCKN
              </label>
              <p className="text-white text-sm font-medium">
                {customer?.vdNo || "Belirtilmemiş"}
              </p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Şehir / İlçe
              </label>
              <p className="text-white text-sm font-medium">
                {customer?.local} / {customer?.district}
              </p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                Adres
              </label>
              <p className="text-gray-300 text-xs leading-snug line-clamp-2">
                {customer?.address || "Adres bilgisi yok."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 shadow-xl text-sm"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
