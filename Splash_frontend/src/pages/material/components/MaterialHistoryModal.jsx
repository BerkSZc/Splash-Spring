import { useState, useEffect, useMemo } from "react";
import { useMaterialPriceHistory } from "../../../../backend/store/useMaterialPriceHistory.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";

export default function MaterialHistoryModal({
  materialId,
  materialName,
  onClose,
  formatDate,
  formatNumber,
  historyType,
}) {
  const {
    history,
    totalPages,
    totalElements,
    getHistoryByYear,
    getHistoryByAllYear,
    loading,
  } = useMaterialPriceHistory();

  const { year } = useYear();
  const { tenant } = useTenant();

  const [selectedType, setSelectedType] = useState("PURCHASE");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!materialId) return;

    if (historyType === "all") {
      getHistoryByAllYear(
        page,
        PAGE_SIZE,
        debouncedSearch,
        materialId,
        tenant,
        selectedType,
      );
    } else {
      getHistoryByYear(
        page,
        PAGE_SIZE,
        debouncedSearch,
        materialId,
        selectedType,
        tenant,
        year,
      );
    }
  }, [
    materialId,
    selectedType,
    year,
    historyType,
    tenant,
    page,
    debouncedSearch,
  ]);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-[9999] backdrop-blur-md p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl text-lg">
                📊
              </span>
              {historyType === "all"
                ? "Tüm Yıllar Fiyat Hareketleri"
                : `${year} Yılı Fiyat Hareketleri`}
            </h2>
            {materialName && (
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                Malzeme:{" "}
                <span className="text-white uppercase font-bold">
                  {materialName}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Seçimi */}
        <div className="flex gap-2 p-1.5 bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
          <button
            onClick={() => {
              setSelectedType("PURCHASE");
              setSearchTerm("");
              setDebouncedSearch("");
              setPage(0);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              selectedType === "PURCHASE"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            🛒 Alış Hareketleri
          </button>
          <button
            onClick={() => {
              setSelectedType("SALES");
              setSearchTerm("");
              setDebouncedSearch("");
              setPage(0);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              selectedType === "SALES"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            💼 Satış Hareketleri
          </button>
        </div>

        {/* Arama Alanı */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Müşteri adı veya tarihe göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border-2 border-gray-800 rounded-2xl text-white outline-none backdrop-blur-sm focus:border-blue-500 transition-all text-sm"
          />
          <svg
            className="w-6 h-6 text-gray-500 absolute left-4 top-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Tablo Alanı */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-16 text-gray-400 animate-pulse font-semibold">
              Fiyat hareketleri yükleniyor...
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-semibold border border-dashed border-gray-800 rounded-2xl">
              Bu malzemeye ait {selectedType === "PURCHASE" ? "Alış" : "Satış"}{" "}
              hareketi bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="py-3 px-4">MÜŞTERİ / CARİ</th>
                  <th className="py-3 px-4 text-center">İŞLEM TARİHİ</th>
                  <th className="py-3 px-4 text-center">MİKTAR</th>
                  <th className="py-3 px-4 text-right">BİRİM FİYAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs font-semibold">
                {history.map((item, idx) => {
                  const customerTitle =
                    item.customerName ||
                    item.customer?.name ||
                    "Bilinmeyen Müşteri";

                  const formattedPrice = formatNumber
                    ? formatNumber(item.price)
                    : item.price?.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td
                        className="py-4 px-4 font-bold text-white max-w-[280px] truncate"
                        title={customerTitle}
                      >
                        {customerTitle}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300 font-mono">
                        {formatDate
                          ? formatDate(item.date)
                          : item.date?.split("-").reverse().join(".")}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300 font-mono">
                        {item.quantity || "0"}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-black font-mono text-sm ${
                          selectedType === "PURCHASE"
                            ? "text-purple-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {formattedPrice} ₺
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Sayfalama ve Alt Kısım */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-800">
          <div className="text-xs font-semibold text-gray-400">
            Toplam Kayıt:{" "}
            <strong className="text-white">
              {totalElements || history?.length || 0}
            </strong>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold disabled:opacity-30 hover:bg-gray-700 transition"
              >
                ← Önceki
              </button>
              <span className="text-gray-400 text-xs font-semibold">
                Sayfa {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold disabled:opacity-30 hover:bg-gray-700 transition"
              >
                Sonraki →
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
