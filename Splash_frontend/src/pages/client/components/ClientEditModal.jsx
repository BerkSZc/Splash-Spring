import { useMemo } from "react";

export default function CustomerEditModal({
  form,
  setForm,
  onCancel,
  onSave,
  formatNumber,
}) {
  const calculatedBalance = useMemo(() => {
    const normalize = (val) => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      return Number(val.toString().replace(/\./g, "").replace(",", ".")) || 0;
    };

    const debit = normalize(form?.yearlyDebit);
    const credit = normalize(form?.yearlyCredit);

    return debit - credit;
  }, [form?.yearlyDebit, form?.yearlyCredit]);

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[1100px] max-h-[95vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Başlık Bölümü */}
        <h2 className="text-3xl font-extrabold mb-10 text-white flex items-center gap-3">
          <span className="p-3 bg-blue-600 rounded-2xl text-xl shadow-lg shadow-blue-600/20">
            🏢
          </span>
          Müşteri Bilgilerini Güncelle
        </h2>

        <div className="space-y-8">
          {/* 1. Üst Satır: Unvan ve Müşteri Kodu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Müşteri / Firma Unvanı
              </label>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-400 uppercase ml-1 tracking-widest">
                Müşteri Kodu
              </label>
              <input
                type="text"
                value={form.code || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.toUpperCase().replace(/\s/g, ""),
                  })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all uppercase font-mono"
              />
            </div>
          </div>

          {/* 2. Finansal Panel: Borç, Alacak ve Net Bakiye (ZIRHLI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/20">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-emerald-500 uppercase ml-1 tracking-widest">
                Borç (Devir)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(form?.yearlyDebit) || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, yearlyDebit: val });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-3 text-right text-emerald-400 outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                  ₺
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-red-400 uppercase ml-1 tracking-widest">
                Alacak (Devir)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatNumber(form?.yearlyCredit) || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, yearlyCredit: val });
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-3 text-right text-red-400 outline-none focus:border-red-400 transition-all font-mono font-bold"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                  ₺
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-widest">
                Net Bakiye (Otomatik)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatNumber(calculatedBalance)}
                  disabled
                  className={`w-full bg-gray-800/50 border-2 border-gray-800/30 rounded-2xl px-5 py-3 text-right font-mono font-bold opacity-80 cursor-not-allowed
                    ${calculatedBalance >= 0 ? "text-emerald-500" : "text-red-500"}`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                  ₺
                </span>
              </div>
            </div>
          </div>

          {/* 3. Orta Bölüm: Vergi Dairesi ve Adres Detayları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-800/30 rounded-[2.5rem] border border-gray-700/50">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Vergi No / VD
              </label>
              <input
                type="text"
                value={form.vdNo || ""}
                onChange={(e) => setForm({ ...form, vdNo: e.target.value })}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                İl
              </label>
              <input
                type="text"
                value={form.local || ""}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                İlçe
              </label>
              <input
                type="text"
                value={form.district || ""}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Ülke
              </label>
              <input
                type="text"
                value={form.country || ""}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* 4. Alt Bölüm: Açık Adres */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Açık Adres
            </label>
            <textarea
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows="2"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Alt Butonlar */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl font-bold hover:bg-gray-700 transition-all active:scale-95 border border-gray-700/50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={onSave}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
