export const MaterialFormCard = ({
  formRef,
  editId,
  form,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <div
    ref={formRef}
    className={`p-8 bg-gray-900/40 border transition-all duration-500 rounded-[2.5rem] ${
      editId
        ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
        : "border-gray-800"
    }`}
  >
    <h2
      className={`text-xl font-bold mb-8 flex items-center gap-3 ${
        editId ? "text-blue-400" : "text-emerald-400"
      }`}
    >
      <span
        className={`w-2 h-7 rounded-full ${
          editId ? "bg-blue-500" : "bg-emerald-500"
        }`}
      ></span>
      {editId ? "Malzeme Bilgilerini Güncelle" : "Yeni Malzeme Tanımla"}
    </h2>

    <form onSubmit={onSubmit} className="space-y-6">
      {/* Üst Satır: Kod, Birim, Açıklama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
            Malzeme Kodu
          </label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={onChange}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
            placeholder="MZ-001"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
            Birim
          </label>
          <select
            name="unit"
            value={form.unit}
            onChange={onChange}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
          >
            <option value="KG">KG</option>
            <option value="ADET">ADET</option>
            <option value="M">METRE (M)</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
            Açıklama
          </label>
          <input
            type="text"
            name="comment"
            value={form.comment}
            onChange={onChange}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
            placeholder="Malzeme detayı..."
            required
          />
        </div>
      </div>

      {/* Alt Satır: Alış ve Satış Fiyatları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-800/30 rounded-3xl border border-gray-800">
        {/* ALIŞ GRUBU */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            Alış Bilgileri
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              name="purchasePrice"
              value={form.purchasePrice || ""}
              onChange={onChange}
              className="w-2/3 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              placeholder="0.00"
            />
            <select
              name="purchaseCurrency"
              value={form.purchaseCurrency}
              onChange={onChange}
              className="w-1/3 bg-gray-800 border-2 border-gray-700 rounded-xl px-2 py-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* SATIŞ GRUBU */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            Satış Bilgileri
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              name="salesPrice"
              value={form.salesPrice || ""}
              onChange={onChange}
              className="w-2/3 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
              placeholder="0.00"
            />
            <select
              name="salesCurrency"
              value={form.salesCurrency}
              onChange={onChange}
              className="w-1/3 bg-gray-800 border-2 border-gray-700 rounded-xl px-2 py-3 text-white focus:border-emerald-500 outline-none"
            >
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className={`w-full md:w-64 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
            editId
              ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
          }`}
        >
          {editId ? "Güncelle" : "Sisteme Kaydet"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full md:w-48 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-all active:scale-95 border border-gray-700"
          >
            Vazgeç
          </button>
        )}
      </div>
    </form>
  </div>
);
