export const YearManager = ({
  year,
  years = [],
  newYear,
  shouldTransfer,
  confirmCheck,
  deleteTarget,
  confirmDeleteCheck,
  onYearChange,
  onConfirmModal,
  onDeleteYear,
  isModalOpen,
  onCloseModal,
  onYearAdd,
  onCloseDelete,
  onNewYearChange,
  onSetDeleteTarget,
  onSetConfirmCheck,
  onSetConfirmDeleteCheck,
}) => {
  const allYears = Array.isArray(years) ? years : [];
  return (
    <div className="space-y-6">
      {/* 1. Başlık Bölümü */}
      <h3 className="text-xl font-semibold flex items-center gap-3">
        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
        Mali Yıl Devir İşlemi
      </h3>

      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-8">
        {/* 2. Kayıtlı Dönemler Bölümü */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Kayıtlı Dönemler
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {[...allYears]
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
                  {years.length > 1 && (
                    <button
                      onClick={() => {
                        onSetDeleteTarget(y);
                      }}
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
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* 3. Yeni Dönem Açma Bölümü */}
        <div className="pt-6 border-t border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Yeni Dönem Aç
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder={`Sıradaki yıl: ${Number(year + 1)}`}
              value={newYear}
              onChange={(e) => onNewYearChange(e.target.value)}
              className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none transition"
            />
            <button
              onClick={onYearAdd} // Hook'tan gelen Click handler
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {/* 4. Onay Modalı (Portal gibi en üstte görünür) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-white mb-2">
              Emin misiniz?
            </h3>
            <p className="text-gray-400 mb-6">
              <span className="text-green-500 font-bold">{newYear}</span> yılı
              açılacak
              {shouldTransfer && " ve bakiyeler devredilecek."} Bu işlem geri
              alınamaz.
            </p>

            <label className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl cursor-pointer group mb-6 border border-transparent hover:border-gray-700 transition">
              <input
                type="checkbox"
                checked={confirmCheck}
                onChange={(e) => onSetConfirmCheck(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-300 select-none">
                Bakiye Deviri yapıp yeni Mali yıla geçiş yapacaksınız devam
                etmek istediğinize emin misiniz?
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSetConfirmCheck(false);
                  onCloseModal();
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800 text-gray-400 font-semibold hover:bg-gray-700 transition"
              >
                Vazgeç
              </button>
              <button
                disabled={!confirmCheck}
                onClick={() => {
                  onConfirmModal();
                  onSetConfirmDeleteCheck(false);
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                  confirmCheck
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
              >
                Onayla ve Başlat
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Dönemi Sil?</h3>
            <p className="text-gray-400 mb-6">
              <span className="text-red-500 font-bold">{deleteTarget}</span>{" "}
              mali yılını silmek üzeresiniz. Bu işlem{" "}
              <span className="text-white font-semibold italic">
                tüm verileri kalıcı olarak yok eder.
              </span>
            </p>

            {/* ONAY CHECKBOX'I */}
            <label className="flex items-center gap-3 p-4 bg-red-500/5 rounded-2xl cursor-pointer group mb-6 border border-transparent hover:border-red-500/20 transition">
              <input
                type="checkbox"
                checked={confirmDeleteCheck}
                onChange={(e) => onSetConfirmDeleteCheck(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-300 select-none">
                Bu mali yılı ve tüm verilerini silmek istediğimden{" "}
                <span className="text-red-400 font-bold">eminim</span>.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={onCloseDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-800 text-gray-400 font-semibold hover:bg-gray-700 transition"
              >
                Vazgeç
              </button>
              <button
                disabled={!confirmDeleteCheck}
                onClick={() => {
                  onDeleteYear(deleteTarget);
                  onCloseDelete();
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                  confirmDeleteCheck
                    ? "bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-lg shadow-red-900/20"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }`}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
