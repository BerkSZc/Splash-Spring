export const CompanyForm = ({ newCompData, setNewCompData, onCreate }) => (
  <div className="p-8 bg-gray-900/40 border border-dashed border-gray-700 rounded-3xl">
    <h3 className="text-xl font-bold mb-6 text-blue-400">
      Yeni Şirket (Şema) Tanımla
    </h3>

    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          Şirket Adı
        </label>
        <input
          placeholder="Örn: Splash"
          value={newCompData.name || ""}
          onChange={(e) =>
            setNewCompData({ ...newCompData, name: e.target.value })
          }
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="flex-[1.5] w-full space-y-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          Açıklama
        </label>
        <input
          placeholder="Şirket hakkında açıklama..."
          value={newCompData.desc || ""}
          onChange={(e) =>
            setNewCompData({ ...newCompData, desc: e.target.value })
          }
          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <button
        onClick={onCreate}
        className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
      >
        Sisteme Tanımla
      </button>
    </div>
  </div>
);
