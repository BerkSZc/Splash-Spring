export default function ClientForm({
  form,
  handleChange,
  handleSubmit,
  formatNumber,
}) {
  const formFields = [
    {
      key: "name",
      label: "Müşteri Unvanı",
      type: "text",
      colSpan: "md:col-span-2",
    },
    {
      key: "code",
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
      type: "text",
      isMoney: true,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/5",
      borderColor: "focus:border-emerald-500",
    },
    {
      key: "yearlyCredit",
      label: "Alacak (Yıllık Devir)",
      type: "text",
      isMoney: true,
      color: "text-red-400",
      bgColor: "bg-red-500/5",
      borderColor: "focus:border-red-400",
    },
    {
      key: "finalBalance",
      label: "Yıllık Net Bakiye (Otomatik)",
      type: "text",
      disabled: true,
      isMoney: true,
    },
    { key: "country", label: "Ülke", type: "text" },
    { key: "local", label: "İl", type: "text" },
    { key: "district", label: "İlçe", type: "text" },
  ];

  return (
    <div
      className={`p-8 bg-gray-900/20 border border-gray-800 rounded-[2.5rem] transition-all duration-500 "border-gray-800"`}
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {(Array.isArray(formFields) ? formFields : []).map((field) => (
          <div key={field.key} className={`space-y-2 ${field.colSpan || ""}`}>
            <label
              className={`text-xs font-bold uppercase tracking-widest ml-1 ${field.color || "text-gray-500"}`}
            >
              {field.label || ""}
            </label>
            <input
              type={field.type}
              name={field.key}
              value={
                field.isMoney
                  ? formatNumber(form[field.key])
                  : form[field.key] || ""
              }
              onChange={(e) => {
                if (field.isMoney) {
                  const val = e.target.value.replace(/[^0-9.,]/g, "");
                  handleChange({ target: { name: field.key, value: val } });
                } else {
                  handleChange;
                }
              }}
              disabled={field.disabled}
              className={`w-full border-2 rounded-xl px-4 py-3 uppercase text-white transition-all outline-none 
                ${field.bgColor || "bg-gray-900/60"} 
                ${field.disabled ? "bg-gray-800/50 border-gray-800 text-gray-400 cursor-not-allowed" : `border-gray-800 ${field.borderColor || "focus:border-blue-500"}`} 
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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
            value={form.address || ""}
            onChange={handleChange}
            required
            className="w-full bg-gray-900/60 border-2 uppercase border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <div className="md:col-span-4 flex justify-end gap-4 pt-4 mt-2 border-t border-gray-800/50">
          <button
            type="submit"
            className={`px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg bg-emerald-600 hover:bg-emerald-500`}
          >
            Sisteme Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
