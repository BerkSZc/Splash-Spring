export const CompanyEditModal = ({
  isOpen,
  data,
  onSave,
  onCancel,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
      <div className="bg-[#0f172a] border border-gray-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-3xl font-black text-white mb-2">Şirketi Düzenle</h2>
        <p className="text-gray-400 mb-8 font-mono text-sm">
          Şema: {data.schemaName || ""}
        </p>

        <div className="space-y-6">
          {/* 1. Şirket Adı */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Şirket Adı / Unvanı
            </label>
            <input
              value={data.name || ""}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all uppercase"
            />
          </div>

          {/* 2. Vergi Numarası */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Vergi Numarası
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={data.vdNo || ""}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                onChange({ ...data, vdNo: numericValue });
              }}
              placeholder="Sadece rakam giriniz"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 3. Şirket Adresi */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Şirket Adresi
            </label>
            <input
              value={data.companyAddress || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  companyAddress: e.target.value,
                })
              }
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all uppercase"
            />
          </div>

          {/* 4. Fatura Açıklaması / Notu */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Fatura Açıklaması / Notu
            </label>
            <textarea
              value={data.invoiceDescription || ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  invoiceDescription: e.target.value,
                })
              }
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all h-28 resize-none uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <button
            onClick={onCancel}
            className="py-4 bg-gray-800 text-gray-400 font-bold rounded-2xl hover:bg-gray-700 transition-all"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            Güncelle
          </button>
        </div>
      </div>
    </div>
  );
};
