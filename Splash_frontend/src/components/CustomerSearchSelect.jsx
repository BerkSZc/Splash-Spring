// Müşteri seçme alanı

import { useState, useRef, useEffect } from "react";
import { useVoucher } from "../../backend/store/useVoucher.js";
import { useClient } from "../../backend/store/useClient.js";
import { useYear } from "../context/YearContext";
import { useTenant } from "../context/TenantContext.jsx";
import toast from "react-hot-toast";

export default function CustomerSearchSelect({ customers, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const {
    vouchers,
    getAllOpeningVoucherByYear,
    loading: vouchersLoading,
  } = useVoucher();
  const { getAllCustomers, loading: customersLoading } = useClient();
  const { year } = useYear();
  const { tenant } = useTenant();

  // Seçili müşteriyi bul
  const selectedCustomer = (Array.isArray(customers) ? customers : []).find(
    (c) => String(c?.id) === String(value),
  );

  // Dışarı tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtreleme (Büyük/Küçük harf duyarsız)
  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter(
    (c) =>
      !c?.archived && // Sadece arşivlenmemiş (archived: false) olanları al
      c?.name?.toLowerCase().includes(search?.toLowerCase()),
  );

  useEffect(() => {
    let ignore = false;
    const fetchAndSyncData = async () => {
      try {
        await getAllCustomers();
        if (year) {
          const dateString = `${year}-01-01`;
          await getAllOpeningVoucherByYear(dateString, tenant);
        }
        if (ignore) return;
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };
    fetchAndSyncData();
    return () => {
      ignore = true;
    };
  }, [year, tenant]);

  const isLoading = customersLoading || vouchersLoading;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={`w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus-within:border-blue-500 cursor-pointer flex justify-between items-center ${
          isLoading
            ? "opacity-70 cursor-not-allowed"
            : "cursor-pointer focus-within:border-blue-500"
        }`}
      >
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          )}
          <span className={selectedCustomer ? "text-white" : "text-gray-500"}>
            {isLoading
              ? "Müşteriler Yükleniyor..."
              : selectedCustomer
                ? selectedCustomer.name
                : "Müşteri / Firma Ara..."}
          </span>
        </div>
        {!isLoading && (
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Arama yapın..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {Array.isArray(filteredCustomers) &&
            filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const myVoucher = (
                  Array.isArray(vouchers) ? vouchers : []
                ).find((v) => v?.customer?.id === c?.id);

                const balanceDisplay = Number(myVoucher?.finalBalance ?? 0);
                return (
                  <div
                    key={c?.id}
                    onClick={() => {
                      onChange(c?.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors flex justify-between items-center ${
                      String(value) === String(c?.id)
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{c?.name || ""}</div>
                      <div className="text-xs opacity-60">
                        Kodu: {c?.code || 0}
                      </div>
                    </div>

                    {/* Voucher'dan gelen dinamik bakiye */}
                    <div
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        balanceDisplay < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {Number(balanceDisplay).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Sonuç bulunamadı
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
