import { useState } from "react";

export const YearManager = ({
  year,
  years,
  newYear,
  shouldTransfer,
  onYearChange,
  onConfirmModal,
  isModalOpen,
  onCloseModal,
  onYearAdd,
  onNewYearChange,
}) => {
  const [confirmCheck, setConfirmCheck] = useState(false);

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
                onChange={(e) => setConfirmCheck(e.target.checked)}
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
                  setConfirmCheck(false);
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
                  setConfirmCheck(false);
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
    </div>
  );
};
