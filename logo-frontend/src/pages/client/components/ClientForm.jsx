export default function ClientForm({
  form,
  editClient,
  handleChange,
  handleSubmit,
  handleCancelEdit,
  formRef,
}) {
  const formFields = [
    {
      key: "name",
      label: "Müşteri Unvanı",
      type: "text",
      colSpan: "md:col-span-2",
    },
    {
      key: "customerCode",
      label: "Müşteri Kodu",
      type: "text",
    },
    {
      key: "vdNo",
      label: "Vergi No / T.C.",
      type: "text",
    },
    {
      key: "yearlyDebit",
      label: "Borç (Yıllık Devir)",
      type: "number",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/5",
      borderColor: "focus:border-emerald-500",
    },
    {
      key: "yearlyCredit",
      label: "Alacak (Yıllık Devir)",
      type: "number",
      color: "text-red-400",
      bgColor: "bg-red-500/5",
      borderColor: "focus:border-red-400",
    },
    {
      key: "finalBalance",
      label: "Yıllık Net Bakiye (Otomatik)",
      type: "number",
      disabled: true,
    },
    { key: "country", label: "Ülke", type: "text" },
    { key: "local", label: "İl", type: "text" },
    { key: "district", label: "İlçe", type: "text" },
  ];

  return (
    <div
      className={`p-8 bg-gray-900/20 border rounded-[2.5rem] transition-all duration-500 ${editClient ? "border-blue-500/40 bg-blue-500/5" : "border-gray-800"}`}
    >
      <h3
        className={`text-xl font-bold mb-8 flex items-center gap-3 ${editClient ? "text-blue-400" : "text-emerald-400"}`}
      >
        <span
          className={`w-2 h-7 rounded-full ${editClient ? "bg-blue-500" : "bg-emerald-500"}`}
        ></span>
        {editClient ? "Müşteri Bilgilerini Güncelle" : "Yeni Müşteri Tanımla"}
      </h3>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {formFields.map((field) => (
          <div key={field.key} className={`space-y-2 ${field.colSpan || ""}`}>
            <label
              className={`text-xs font-bold uppercase tracking-widest ml-1 ${field.color || "text-gray-500"}`}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.key}
              value={form[field.key] ?? (field.type === "number" ? 0 : "")}
              onChange={handleChange}
              disabled={field.disabled}
              className={`w-full border-2 rounded-xl px-4 py-3 text-white transition-all outline-none 
                ${field.bgColor || "bg-gray-900/60"} 
                ${field.disabled ? "bg-gray-800/50 border-gray-800 text-gray-400 cursor-not-allowed" : `border-gray-800 ${field.borderColor || "focus:border-blue-500"}`} 
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </div>
        ))}

        {/* Tam Adres - .map dışında bırakmak daha esnek olabilir veya diziye eklenebilir */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
            Tam Adres
          </label>
          <input
            type="text"
            name="address"
            value={form.address || ""}
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
            className={`px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg ${editClient ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
          >
            {editClient ? "Güncelle" : "Sisteme Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
