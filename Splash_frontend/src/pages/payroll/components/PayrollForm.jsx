import CustomerSearchSelect from "../../../components/CustomerSearchSelect.jsx";

export default function PayrollForm({
  form,
  setForm,
  currentTheme,
  editing,
  onSubmit,
  onReset,
  customers,
}) {
  return (
    <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] shadow-2xl">
      <h3
        className={`text-xl font-bold mb-8 flex items-center gap-3 ${currentTheme.color}`}
      >
        <span className={`w-2 h-7 rounded-full ${currentTheme.bg}`}></span>
        {editing ? "Kayıt Düzenle" : `Yeni ${currentTheme.label} Kaydı`}
      </h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              İşlem Tarihi
            </label>
            <input
              type="date"
              value={form.transactionDate}
              required
              onChange={(e) =>
                setForm({ ...form, transactionDate: e.target.value })
              }
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Vade Tarihi
            </label>
            <input
              type="date"
              value={form.expiredDate}
              required
              onChange={(e) =>
                setForm({ ...form, expiredDate: e.target.value })
              }
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/20 outline-none transition"
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Müşteri / Firma
            </label>
            <CustomerSearchSelect
              customers={customers}
              value={form.customerId}
              onChange={(id) => setForm({ ...form, customerId: id })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Evrak Seri/No
            </label>
            <input
              type="text"
              placeholder="Örn: ABC-123"
              value={form.fileNo}
              onChange={(e) => setForm({ ...form, fileNo: e.target.value })}
              className="w-full uppercase bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Banka Adı
            </label>
            <input
              type="text"
              placeholder="Banka ismi..."
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Şube Bilgisi
            </label>
            <input
              type="text"
              placeholder="Şube..."
              value={form.bankBranch}
              onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
              Tutar (₺)
            </label>
            <input
              required
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono font-bold transition"
            />
          </div>
          <div className="flex gap-3 items-end">
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl ${currentTheme.bg} hover:brightness-110`}
            >
              {editing ? "Kaydı Güncelle" : "Hızlı Ekle"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={onReset}
                className="px-5 py-3 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition"
              >
                İptal
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
