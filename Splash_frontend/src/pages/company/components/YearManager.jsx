export const YearManager = ({
  year,
  years,
  newYear,
  shouldTransfer, // Yeni prop
  onYearChange,
  onYearRemove,
  onYearAdd,
  onNewYearChange,
  onTransferChange, // Yeni prop: setShouldTransfer'i tetikler
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold flex items-center gap-3">
      <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
      Mali Yıl Yönetimi
    </h3>

    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-8">
      {/* Kayıtlı Dönemler Bölümü */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Kayıtlı Dönemler
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {[...years]
            .sort((a, b) => b - a)
            .map((y) => (
              <div
                key={y}
                className={`flex items-center justify-between p-3 rounded-xl transition ${
                  year === y
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-gray-800/50 border border-transparent"
                }`}
              >
                <button
                  onClick={() => onYearChange(Number(y))}
                  className={`flex-1 text-left font-semibold ${
                    year === y ? "text-green-400" : "text-gray-300"
                  }`}
                >
                  {y} Mali Yılı {year === y && "✓"}
                </button>
                <button
                  onClick={() => onYearRemove(y)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Yeni Dönem Açma ve Devir İşlemi Bölümü */}
      <div className="pt-6 border-t border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Yeni Dönem Aç
          </label>

          {/* Fonksiyonel Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={shouldTransfer}
              onChange={(e) => onTransferChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500/50 transition cursor-pointer"
            />
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition">
              Bakiye Devri Yapılsın
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Örn: 2026"
            value={newYear}
            onChange={(e) => onNewYearChange(e.target.value)}
            className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none transition"
          />
          <button
            onClick={onYearAdd}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  </div>
);
