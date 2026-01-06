export const CompanyForm = ({ newCompData, setNewCompData, onCreate }) => (
  <div className="p-8 bg-gray-900/40 border border-dashed border-gray-700 rounded-3xl">
    <h3 className="text-xl font-bold mb-6 text-blue-400">
      Yeni Şirket (Şema) Tanımla
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        placeholder="Şirket Kodu (logo_2)"
        value={newCompData.id}
        onChange={(e) =>
          setNewCompData({
            ...newCompData,
            id: e.target.value.toLowerCase().replace(" ", "_"),
          })
        }
        className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
      />

      <input
        placeholder="Şirket Adı"
        value={newCompData.name}
        onChange={(e) =>
          setNewCompData({ ...newCompData, name: e.target.value })
        }
        className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
      />
      <input
        placeholder="Açıklama"
        value={newCompData.desc}
        onChange={(e) =>
          setNewCompData({ ...newCompData, desc: e.target.value })
        }
        className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
      />
      <button
        onClick={onCreate}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
      >
        Sisteme Tanımla
      </button>
    </div>
  </div>
);
