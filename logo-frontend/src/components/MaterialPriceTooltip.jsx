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

  const handleSelect = () => {
    if (currentItem && onSelect) {
      onSelect(currentItem.price);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={`px-2 py-1 text-gray-600 hover:text-gray-900 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        ⋮
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-130 p-7 relative">
            {/* Kapatma butonu */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-1 right-1 text-red-500 text-lg font-bold"
            >
              ✕
            </button>

            {/* Fatura tipi seçimi */}
            <div className="mb-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border rounded p-1 w-full"
              >
                <option value="PURCHASE">Son Satın Alma</option>
                <option value="SALES">Son Satış</option>
              </select>
            </div>

            {/* Fiyat geçmişi */}
            <div className="text-center mb-4">
              {currentItem ? (
                <>
                  <p>
                    Fiyat: <strong>{currentItem.price?.toFixed(2)} ₺</strong>
                  </p>
                  <p>Tarih: {currentItem.date}</p>
                  {currentItem.customerName && (
                    <p>Müşteri: {currentItem.customerName}</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {currentIndex + 1} / {history.length}
                  </p>
                </>
              ) : (
                <p className="text-gray-400">Geçmiş yok</p>
              )}
            </div>

            {/* İleri / Geri Butonları */}
            <div className="flex justify-between mb-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-3 py-1 rounded ${
                  currentIndex === 0
                    ? "bg-gray-300 text-gray-600"
                    : "bg-blue-500 text-white"
                }`}
              >
                ← Geri
              </button>

              <button
                onClick={handleNext}
                disabled={
                  currentIndex === history?.length - 1 || !history?.length
                }
                className={`px-3 py-1 rounded ${
                  currentIndex === history?.length - 1 || !history?.length
                    ? "bg-gray-300 text-gray-600"
                    : "bg-blue-500 text-white"
                }`}
              >
                İleri →
              </button>
            </div>

            {/* Seç Butonu */}
            {currentItem && (
              <div className="text-center">
                <button
                  onClick={handleSelect}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Seç
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
