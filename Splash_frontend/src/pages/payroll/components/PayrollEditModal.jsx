import CustomerSearchSelect from "../../../components/CustomerSearchSelect.jsx";

export default function PayrollEditModal({
  form,
  setForm,
  currentTheme,
  customers,
  onCancel,
  onSave,
  formatNumber,
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[1200px] shadow-2xl relative">
        <h2
          className={`text-3xl font-extrabold mb-10 text-white flex items-center gap-3`}
        >
          <span
            className={`p-3 rounded-2xl text-xl shadow-lg ${currentTheme.bg}`}
          >
            📜
          </span>
          {currentTheme.label} Kaydını Güncelle
        </h2>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                İşlem Tarihi
              </label>
              <input
                type="date"
                value={form?.transactionDate || ""}
                onChange={(e) =>
                  setForm({ ...form, transactionDate: e.target.value })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Vade Tarihi
              </label>
              <input
                type="date"
                value={form?.expiredDate || ""}
                onChange={(e) =>
                  setForm({ ...form, expiredDate: e.target.value })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Müşteri / Firma
              </label>
              <CustomerSearchSelect
                customers={customers}
                value={form.customerId}
                onChange={(id) => setForm({ ...form, customerId: id })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-800/30 rounded-[2.5rem] border border-gray-700/50">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-blue-400 uppercase ml-1 tracking-widest">
                Evrak Seri/No
              </label>
              <input
                type="text"
                value={form?.fileNo || ""}
                onChange={(e) =>
                  setForm({ ...form, fileNo: e.target.value.toUpperCase() })
                }
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all uppercase font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Banka Adı
              </label>
              <input
                type="text"
                value={form?.bankName || ""}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Şube Bilgisi
              </label>
              <input
                type="text"
                value={form?.bankBranch || ""}
                onChange={(e) =>
                  setForm({ ...form, bankBranch: e.target.value })
                }
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-emerald-400 uppercase ml-1 tracking-widest">
                Tutar (₺)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={formatNumber(form?.amount) || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, amount: val });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-3 text-right text-emerald-400 outline-none focus:border-emerald-500 transition-all font-mono font-bold text-lg"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                  ₺
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl font-bold hover:bg-gray-700 transition-all active:scale-95"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={onSave}
              className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95 shadow-blue-600/20 ${currentTheme.bg} hover:brightness-110`}
            >
              Değişiklikleri Uygula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
