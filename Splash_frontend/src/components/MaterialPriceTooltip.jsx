//Fatura oluşturma sayfası için malzeme fiyatının geçmişini öğrenme ve seçme alanı

import { useState, useEffect, useRef } from "react";
import { useMaterialPriceHistory } from "../../backend/store/useMaterialPriceHistory.js";
import { useYear } from "../context/YearContext.jsx";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useTenant } from "../context/TenantContext.jsx";

export default function MaterialPriceTooltip({
  materialId,
  customerId,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchMode, setSearchMode] = useState(null);

  const {
    history,
    totalPages,
    totalElements,
    getHistoryByAllYear,
    getHistoryByYear,
    getHistoryByCustomerAndYear,
    getHistoryByCustomerAndAllYear,
    loading: materialPriceLoading,
  } = useMaterialPriceHistory();

  const [selectedType, setSelectedType] = useState("PURCHASE");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { year } = useYear();
  const { tenant } = useTenant();
  const menuRef = useRef(null);
  const menuPopupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuPopupRef.current &&
        !menuPopupRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const performSearch = async (type, mode, currentPage, currentSearch) => {
    if (!materialId || !mode) return;

    try {
      if (mode === "YEARLY") {
        await getHistoryByYear(
          currentPage,
          PAGE_SIZE,
          currentSearch,
          materialId,
          type,
          tenant,
          year,
        );
      } else if (mode === "ALL") {
        await getHistoryByAllYear(
          currentPage,
          PAGE_SIZE,
          currentSearch,
          materialId,
          tenant,
          type,
        );
      } else if (mode === "CUSTOMER-YEARLY") {
        await getHistoryByCustomerAndYear(
          currentPage,
          PAGE_SIZE,
          currentSearch,
          customerId,
          materialId,
          type,
          tenant,
          year,
        );
      } else if (mode === "CUSTOMER-ALL") {
        await getHistoryByCustomerAndAllYear(
          currentPage,
          PAGE_SIZE,
          currentSearch,
          customerId,
          materialId,
          tenant,
          type,
        );
      }
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleMenuClick = (e, mode) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      (mode === "CUSTOMER-YEARLY" || mode === "CUSTOMER-ALL") &&
      !customerId
    ) {
      toast.error("Önce bir müşteri seçmelisiniz!");
      return;
    }
    setSearchMode(mode);
    setShowMenu(false);
    setSearchTerm("");
    setOpen(true);
    setDebouncedSearch("");
    setPage(0);
  };

  useEffect(() => {
    if (open && searchMode) {
      performSearch(selectedType, searchMode, page, debouncedSearch);
    }
  }, [selectedType, materialId, open, searchMode, page, debouncedSearch]);

  const handleSelectPrice = (price) => {
    if (onSelect) {
      onSelect(Number(price) || 0);
      setOpen(false);
    }
  };

  const formatDateToTR = (dateString) => {
    if (!dateString || typeof dateString !== "string") return dateString;
    if (dateString.includes(".")) return dateString;

    const [y, m, d] = dateString.split("-");
    return `${d}.${m}.${y}`;
  };

  const getModalTitle = () => {
    switch (searchMode) {
      case "YEARLY":
        return `${year} Yılı Fiyat Analizi`;
      case "ALL":
        return "Tüm Yıllar Fiyat Analizi";
      case "CUSTOMER-YEARLY":
        return `Müşteriye Göre ${year} Yılı Fiyat Analizi`;
      case "CUSTOMER-ALL":
        return "Müşteriye Göre Tüm Yıllar Fiyat Analizi";
      default:
        return "Fiyat Analizi";
    }
  };

  const isLoading = materialPriceLoading;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && !isLoading) setShowMenu(!showMenu);
        }}
        disabled={disabled || isLoading}
        className={`p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-all border border-gray-700 flex items-center justify-center ${
          disabled || isLoading
            ? "opacity-30 cursor-not-allowed"
            : "hover:text-blue-400 active:scale-95"
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        ) : (
          <span className="font-black tracking-widest text-lg leading-none mb-1">
            ...
          </span>
        )}
      </button>

      {showMenu &&
        document.body &&
        createPortal(
          <div
            ref={menuPopupRef}
            className="fixed left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[10001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: menuRef.current?.getBoundingClientRect().bottom + 8,
              left: menuRef.current?.getBoundingClientRect().left - 180,
            }}
          >
            <button
              type="button"
              onClick={(e) => handleMenuClick(e, "YEARLY")}
              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-blue-600 hover:text-white transition-colors border-b border-gray-800"
            >
              📅 {year} Yılı İçinde Ara
            </button>
            <button
              type="button"
              onClick={(e) => handleMenuClick(e, "ALL")}
              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-blue-600 hover:text-white transition-colors border-b border-gray-800"
            >
              🌍 Tüm Yıllarda Ara
            </button>
            <button
              type="button"
              onClick={(e) => handleMenuClick(e, "CUSTOMER-YEARLY")}
              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-emerald-600 hover:text-white transition-colors border-b border-gray-800"
            >
              👤 Müşteriye Göre {year} Yılında Ara
            </button>
            <button
              type="button"
              onClick={(e) => handleMenuClick(e, "CUSTOMER-ALL")}
              className="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-emerald-600 hover:text-white transition-colors"
            >
              👥 Müşteriye Göre Tüm Yıllarda Ara
            </button>
          </div>,
          document.body,
        )}

      {open && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-[9999] backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl text-lg">
                    📊
                  </span>
                  {getModalTitle()}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Tab Seçimi */}
            <div className="flex gap-2 p-1.5 bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
              <button
                type="button"
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
                type="button"
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
              {isLoading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse font-semibold">
                  Fiyat hareketleri sorgulanıyor...
                </div>
              ) : !history || history.length === 0 ? (
                <div className="text-center py-16 text-gray-500 font-semibold border border-dashed border-gray-800 rounded-2xl">
                  Bu kritere uygun{" "}
                  {selectedType === "PURCHASE" ? "Alış" : "Satış"} kaydı
                  bulunamadı.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <th className="py-3 px-4">MÜŞTERİ / CARİ</th>
                      <th className="py-3 px-4 text-center">İŞLEM TARİHİ</th>
                      <th className="py-3 px-4 text-center">MİKTAR</th>
                      <th className="py-3 px-4 text-right">BİRİM FİYAT</th>
                      <th className="py-3 px-4 text-center">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs font-semibold">
                    {history.map((item, idx) => {
                      const customerTitle =
                        item.customerName ||
                        item.customer?.name ||
                        "Bilinmeyen Müşteri";

                      return (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td
                            className="py-4 px-4 font-bold text-white max-w-[240px] truncate"
                            title={customerTitle}
                          >
                            {customerTitle}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-300 font-mono">
                            {formatDateToTR(item.date)}
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
                            {(item.price ?? 0)?.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ₺
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectPrice(item.price)}
                              className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto active:scale-95"
                              title="Bu fiyatı faturaya aktar"
                            >
                              <span>Seç</span>
                              <span>✓</span>
                            </button>
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
                    type="button"
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
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold disabled:opacity-30 hover:bg-gray-700 transition"
                  >
                    Sonraki →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
