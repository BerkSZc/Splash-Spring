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
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Şirket Adı
            </label>
            <input
              value={data.name || ""}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-500 uppercase ml-1">
              Açıklama
            </label>
            <textarea
              value={data.description || ""}
              onChange={(e) =>
                onChange({ ...data, description: e.target.value })
              }
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all h-32 resize-none"
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
