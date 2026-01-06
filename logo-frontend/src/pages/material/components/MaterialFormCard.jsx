export const MaterialFormCard = ({
  formRef,
  editId,
  form,
  onChange,
  onSubmit,
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

    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          placeholder="Örn: MZ-001"
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
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none cursor-pointer"
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
          placeholder="Malzeme detayı giriniz..."
          required
        />
      </div>

      <div className="md:col-span-1 flex items-end">
        <button
          type="submit"
          className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
            editId
              ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
          }`}
        >
          {editId ? "Güncelle" : "Sisteme Kaydet"}
        </button>
      </div>
    </form>
  </div>
);
