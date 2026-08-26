import { useEffect, useState } from "react";
import { useInvoice } from "../../../../backend/store/useInvoice.js";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext.jsx";

export default function ClientInvoiceMovementsModal({
  customer,
  onClose,
  formatNumber,
}) {
  const { getAllInvoicesByCustomerId, invoice, invoiceTotalPages, loading } =
    useInvoice();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("SALES");
  const [page, setPage] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!customer?.id) return;

    getAllInvoicesByCustomerId(
      customer.id,
      page,
      20,
      debouncedSearch,
      activeTab,
      tenant,
    );
  }, [customer?.id, activeTab, page, tenant, debouncedSearch]);

  const handleGoToInvoice = (inv) => {
    const invYear = new Date(inv.date).getFullYear();
    const tabType = inv.invoiceType === "PURCHASE" ? "purchase" : "sales";

    navigate(
      `/faturalar?tab=${tabType}&year=${invYear}&search=${inv.fileNo}&selectedId=${inv.id}`,
    );
  };

  if (!customer) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-[9999] backdrop-blur-md p-4">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl text-lg">
                🧾
              </span>
              Fatura Hareketleri
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              Müşteri:{" "}
              <span className="text-white uppercase font-bold">
                {customer.name}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Seçimi (Satış / Satın Alma) */}
        <div className="flex gap-2 p-1.5 bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
          <button
            onClick={() => {
              setActiveTab("SALES");
              setSearchTerm("");
              setDebouncedSearch("");
              setPage(0);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === "SALES"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            💼 Satış Faturaları
          </button>
          <button
            onClick={() => {
              setActiveTab("PURCHASE");
              setSearchTerm("");
              setDebouncedSearch("");
              setPage(0);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === "PURCHASE"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            🛒 Satın Alma Faturaları
          </button>
        </div>

        {/* ARAMA */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Fatura no, müşteri adı veya tarihe göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border-2 border-gray-800 rounded-2xl text-white outline-none backdrop-blur-sm focus:border-blue-500 transition-all"
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
              Faturalar yükleniyor...
            </div>
          ) : !invoice || invoice.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-semibold border border-dashed border-gray-800 rounded-2xl">
              Bu müşteriye ait {activeTab === "SALES" ? "Satış" : "Satın Alma"}{" "}
              faturası bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="py-3 px-4">FATURA NO</th>
                  <th className="py-3 px-4 text-center">TARİH</th>
                  <th className="py-3 px-4 text-center">E-FATURA</th>
                  <th className="py-3 px-4 text-right">TOPLAM TUTAR</th>
                  <th className="py-3 px-4 text-center">İŞLEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs font-semibold">
                {invoice.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-blue-400 font-mono">
                      {inv.fileNo || "—"}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-300 font-mono">
                      {inv.date ? inv.date.split("-").reverse().join(".") : "—"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                          inv.invoiced
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        ● {inv.invoiced ? "Kesildi" : "Kesilmedi"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-emerald-400 font-mono text-sm">
                      {formatNumber
                        ? formatNumber(inv.totalPrice)
                        : inv.totalPrice}{" "}
                      ₺
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleGoToInvoice(inv)}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto"
                        title="Faturaya Git"
                      >
                        <span>Detay</span>
                        <span>↗</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {invoiceTotalPages > 1 && (
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-800">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold disabled:opacity-30 hover:bg-gray-700 transition"
            >
              ← Önceki
            </button>
            <span className="text-gray-400 text-xs font-semibold">
              Sayfa {page + 1} / {invoiceTotalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(invoiceTotalPages - 1, p + 1))
              }
              disabled={page >= invoiceTotalPages - 1}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold disabled:opacity-30 hover:bg-gray-700 transition"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
