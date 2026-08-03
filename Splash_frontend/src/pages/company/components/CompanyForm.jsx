export const CompanyForm = ({
  newCompData,
  setNewCompData,
  onCreate,
  onCancel,
}) => (
  <div className="p-8 bg-gray-900/40 border border-dashed border-gray-700 rounded-3xl space-y-6">
    <h3 className="text-xl font-bold text-blue-400">Yeni Şirket Tanımla</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Şirket Adı */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          Şirket Adı / Unvanı
        </label>
        <input
          value={newCompData.name || ""}
          onChange={(e) =>
            setNewCompData({
              ...newCompData,
              name: e.target.value,
            })
          }
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all uppercase"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          Vergi Numarası
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={newCompData.vdNo || ""}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, "");
            setNewCompData({ ...newCompData, vdNo: numericValue });
          }}
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* 3. Şirket Adresi */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold text-gray-500 tracking-widest ml-1 uppercase">
          Şirket Adresi
        </label>
        <input
          value={newCompData.companyAddress || ""}
          onChange={(e) =>
            setNewCompData({
              ...newCompData,
              companyAddress: e.target.value,
            })
          }
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all uppercase"
        />
      </div>

      {/* 4. Fatura Açıklaması / Notu */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          Fatura Açıklaması / Notu
        </label>
        <input
          value={newCompData.invoiceDescription || ""}
          onChange={(e) =>
            setNewCompData({
              ...newCompData,
              invoiceDescription: e.target.value,
            })
          }
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all uppercase"
        />
      </div>
    </div>

    {/* Kaydet Butonu */}
    <div className="flex justify-end items-center gap-4 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="w-full md:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all active:scale-95"
      >
        Vazgeç
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
      >
        Sisteme Tanımla
      </button>
    </div>
  </div>
);
