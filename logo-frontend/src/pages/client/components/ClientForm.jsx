export default function ClientForm({
  form,
  editClient,
  handleChange,
  handleSubmit,
  handleCancelEdit,
  formRef,
}) {
  return (
    <div
      className={`p-8 bg-gray-900/20 border rounded-[2.5rem] transition-all duration-500 ${
        editClient ? "border-blue-500/40 bg-blue-500/5" : "border-gray-800"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-8 flex items-center gap-3 ${
          editClient ? "text-blue-400" : "text-emerald-400"
        }`}
      >
        <span
          className={`w-2 h-7 rounded-full ${
            editClient ? "bg-blue-500" : "bg-emerald-500"
          }`}
        ></span>
        {editClient ? "Müşteri Bilgilerini Güncelle" : "Yeni Müşteri Tanımla"}
      </h3>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          ["name", "Müşteri Unvanı", "text"],
          ["openingBalance", "Açılış Bakiyesi (Devir)", "number"],
          ["balance", "Güncel Bakiye", "number"],
          ["country", "Ülke", "text"],
          ["local", "İl", "text"],
          ["district", "İlçe", "text"],
          ["vdNo", "Vergi No", "text"],
        ].map(([key, label, type]) => (
          <div key={key} className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              {label}
            </label>
            <input
              type={type}
              name={key}
              value={form[key] ?? (type === "number" ? 0 : "")}
              onChange={handleChange}
              disabled={key === "balance" || key === "number"}
              required={key !== "balance" || key !== "number"}
              className="w-full bg-gray-900/60 border-2 border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
            Tam Adres
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full bg-gray-900/60 border-2 border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="md:col-span-4 flex justify-end gap-4 pt-4 mt-2 border-t border-gray-800/50">
          {editClient && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-8 py-3 text-gray-400 font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className={`px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg ${
              editClient
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {editClient ? "Güncelle" : "Sisteme Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
