const MaterialEditModal = ({ form, onChange, onSave, onCancel }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/90 z-[999] backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-hidden">
      {/* Modal Kutusu */}
      <div className="bg-[#0f172a] border border-gray-800 p-8 md:p-10 rounded-[3rem] w-full max-w-[1200px] shadow-2xl relative animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
        {" "}
        <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3 shrink-0">
          <span className="p-3 bg-blue-600 rounded-2xl text-xl shadow-lg shadow-blue-600/20">
            📦
          </span>
          Malzeme Bilgilerini Güncelle
        </h2>
        <form
          onSubmit={onSave}
          className="space-y-8 overflow-y-auto pr-4 custom-scrollbar"
        >
          {/* Üst Satır */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Malzeme Kodu
              </label>
              <input
                type="text"
                name="code"
                value={form?.code || ""}
                onChange={onChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all uppercase font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Birim
              </label>
              <select
                name="unit"
                value={form.unit || "KG"}
                onChange={onChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="KG">KG</option>
                <option value="ADET">ADET</option>
                <option value="M">METRE (M)</option>
                <option value="LT">LT</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Açıklama / Detay
              </label>
              <input
                type="text"
                name="comment"
                value={form.comment || ""}
                onChange={onChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Fiyat Grubu Kutusu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-800/30 rounded-[2.5rem] border border-gray-700/50">
            {/* Alış Bölümü */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Alış Bilgileri
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="purchasePrice"
                  value={form.purchasePrice || ""}
                  placeholder="0,00"
                  className="col-span-2 bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-4 text-right text-blue-400 outline-none focus:border-blue-500 transition-all font-mono font-bold text-xl"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw.replace(/[^0-9,]/g, "");
                    const parts = cleaned.split(",");
                    const intPart = parts[0].replace(/[^0-9]/g, "");
                    const decPart =
                      parts.length > 1 ? parts[1].slice(0, 2) : null;
                    const formatted =
                      decPart !== null
                        ? `${Number(intPart || 0).toLocaleString("tr-TR")},${decPart}`
                        : Number(intPart || 0).toLocaleString("tr-TR");
                    onChange({
                      target: { name: "purchasePrice", value: formatted },
                    });
                  }}
                />
                <select
                  name="purchaseCurrency"
                  value={form.purchaseCurrency || "TRY"}
                  onChange={onChange}
                  className="bg-gray-900 border-2 border-gray-700 rounded-2xl px-3 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            {/* Satış Bölümü */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Satış Bilgileri
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="salesPrice"
                  value={form.salesPrice || ""}
                  placeholder="0,00"
                  className="col-span-2 bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-4 text-right text-emerald-400 outline-none focus:border-emerald-500 transition-all font-mono font-bold text-xl"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw.replace(/[^0-9,]/g, "");
                    const parts = cleaned.split(",");
                    const intPart = parts[0].replace(/[^0-9]/g, "");
                    const decPart =
                      parts.length > 1 ? parts[1].slice(0, 2) : null;
                    const formatted =
                      decPart !== null
                        ? `${Number(intPart || 0).toLocaleString("tr-TR")},${decPart}`
                        : Number(intPart || 0).toLocaleString("tr-TR");
                    onChange({
                      target: { name: "salesPrice", value: formatted },
                    });
                  }}
                />
                <select
                  name="salesCurrency"
                  value={form.salesCurrency || "TRY"}
                  onChange={onChange}
                  className="bg-gray-900 border-2 border-gray-700 rounded-2xl px-3 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 bg-gray-800 text-gray-400 rounded-2xl font-bold hover:bg-gray-700 transition-all active:scale-95"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
            >
              Güncellemeleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialEditModal;
