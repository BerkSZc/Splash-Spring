//Fatura oluşturma sayfası için malzeme fiyatının geçmişini öğrenme ve seçme alanı

import { useState, useEffect } from "react";
import { useMaterialPriceHistory } from "../../backend/store/useMaterialPriceHistory.js";

export default function MaterialPriceTooltip({
  materialId,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const { history, getHistoryByType } = useMaterialPriceHistory();
  const [selectedType, setSelectedType] = useState("PURCHASE");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open) {
      getHistoryByType(materialId, selectedType);
      setCurrentIndex(0);
    }
  }, [open, selectedType, materialId]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1));

  const currentItem = history?.[currentIndex];

  const handleSelect = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentItem && onSelect) {
      onSelect(currentItem.price);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-all border border-gray-700 flex items-center justify-center ${
          disabled
            ? "opacity-30 cursor-not-allowed"
            : "hover:text-blue-400 active:scale-95"
        }`}
        title="Fiyat Geçmişi"
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
            d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-300">
            {/* Kapatma butonu */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-400 p-2 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-2 bg-blue-600/20 text-blue-500 rounded-lg text-sm">
                ₺
              </span>
              Fiyat Analizi
            </h3>

            {/* Fatura tipi seçimi */}
            <div className="mb-8">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-1">
                İşlem Türü
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedType("PURCHASE");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    selectedType === "PURCHASE"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Alış
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("SALES")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    selectedType === "SALES"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Satış
                </button>
              </div>
            </div>

            {/* Fiyat geçmişi kartı */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-8 min-h-[160px] flex flex-col justify-center relative overflow-hidden group">
              {currentItem ? (
                <>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 text-xs">Birim Fiyat</span>
                      <span
                        className={`text-2xl font-black font-mono ${
                          selectedType === "PURCHASE"
                            ? "text-blue-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {currentItem.price?.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                      <div>
                        <span className="text-gray-500 text-[10px] uppercase block">
                          Miktar
                        </span>
                        <span className="text-gray-200 font-bold text-sm">
                          {currentItem.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-[10px] uppercase block">
                          Tarih
                        </span>
                        <span className="text-gray-200 font-bold text-sm">
                          {currentItem.date}
                        </span>
                      </div>
                    </div>

                    {currentItem.customerName && (
                      <div className="pt-2">
                        <span className="text-gray-500 text-[10px] uppercase block">
                          İlgili Cari
                        </span>
                        <span className="text-gray-300 text-xs font-medium truncate block italic">
                          "{currentItem.customerName}"
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-4 text-[10px] font-mono text-gray-700">
                    {currentIndex + 1} / {history.length}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-gray-500 text-sm italic font-medium">
                    Bu işlem türünde kayıt bulunamadı
                  </p>
                </div>
              )}
            </div>

            {/* Navigasyon ve Seçim */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 bg-gray-800 text-gray-300 rounded-2xl hover:bg-gray-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-90"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {currentItem ? (
                <button
                  type="button"
                  onClick={handleSelect}
                  className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ${
                    selectedType === "PURCHASE"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
                  }`}
                >
                  Bu Fiyatı Kullan
                </button>
              ) : (
                <div className="flex-1"></div>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  currentIndex === (history?.length || 1) - 1 ||
                  !history?.length
                }
                className="p-4 bg-gray-800 text-gray-300 rounded-2xl hover:bg-gray-700 disabled:opacity-20 disabled:grayscale transition-all active:scale-90"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
