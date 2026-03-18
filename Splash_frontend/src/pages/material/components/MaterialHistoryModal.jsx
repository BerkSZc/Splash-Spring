import { useState, useEffect } from "react";
import { useMaterialPriceHistory } from "../../../../backend/store/useMaterialPriceHistory.js";
import { useYear } from "../../../context/YearContext.jsx";

export default function MaterialHistoryModal({
  materialId,
  onClose,
  formatDate,
}) {
  const { history, getHistoryByYear, loading } = useMaterialPriceHistory();
  const { year } = useYear();
  const [selectedType, setSelectedType] = useState("PURCHASE");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (materialId) {
      getHistoryByYear(materialId, selectedType, year);
      setCurrentIndex(0);
    }
  }, [materialId, selectedType, year]);

  const currentItem = history && history[currentIndex];
  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1));

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-gray-800 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="p-2 bg-blue-600/20 text-blue-500 rounded-lg text-sm">
            📊
          </span>
          {year} Yılı Hareketleri
        </h3>

        {/* Tür Seçimi */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          {["PURCHASE", "SALES"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedType === t
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              {t === "PURCHASE" ? "Alışlar" : "Satışlar"}
            </button>
          ))}
        </div>

        {/* Bilgi Kartı */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6 min-h-[200px] flex flex-col justify-center">
          {loading ? (
            <div className="text-center animate-pulse space-y-2">
              <div className="h-8 w-24 bg-gray-800 rounded mx-auto"></div>
              <div className="h-4 w-32 bg-gray-800 rounded mx-auto"></div>
            </div>
          ) : currentItem ? (
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Birim Fiyat
                </span>
                <span
                  className={`text-2xl font-black font-mono ${
                    selectedType === "PURCHASE"
                      ? "text-blue-400"
                      : "text-emerald-400"
                  }`}
                >
                  {currentItem.price?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₺
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800/50">
                <div>
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">
                    Miktar
                  </span>
                  <span className="text-white font-bold">
                    {currentItem?.quantity || "0"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">
                    İşlem Tarihi
                  </span>
                  <span className="text-white font-mono text-sm">
                    {formatDate(currentItem.date) || ""}
                  </span>
                </div>
              </div>

              {/* MÜŞTERİ İSMİ ALANI */}
              <div>
                <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">
                  Müşteri / Cari
                </span>
                <p className="text-gray-200 text-sm font-semibold truncate bg-gray-800/40 p-2 rounded-lg border border-gray-800">
                  {currentItem?.customerName ||
                    currentItem?.customer?.name ||
                    "Bilinmeyen Müşteri"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm italic py-10">
              Bu türde bir kayıt bulunamadı.
            </div>
          )}
        </div>

        {/* Navigasyon ve Alt Bilgi */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || !history?.length}
              className="p-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              ◀
            </button>

            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl border border-gray-700 transition-all"
            >
              Kapat
            </button>

            <button
              onClick={handleNext}
              disabled={!history || currentIndex >= history.length - 1}
              className="p-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              ▶
            </button>
          </div>

          {history?.length > 0 && (
            <div className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              Kayıt: {currentIndex + 1} / {history.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
