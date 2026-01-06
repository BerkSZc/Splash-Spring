/*-------------------------------
                  KALDIRILCAK
------------------------------*/

import React, { useEffect } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice.js";
import { useClient } from "../../backend/store/useClient.js";
import { useReceivedCollection } from "../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../backend/store/usePaymentCompany.js";
import { useYear } from "../context/YearContext.jsx";
import { useTenant } from "../context/TenantContext.jsx";
import QuickLinkCard from "../components/QuickLinkCard.jsx";
import { useCompany } from "../../backend/store/useCompany.js";

export function HomePage() {
  const { companies, getAllCompanies } = useCompany();

  const { purchase, getAllPurchaseInvoices, getPurchaseInvoiceByYear } =
    usePurchaseInvoice();
  const { sales, getAllSalesInvoices, getSalesInvoicesByYear } =
    useSalesInvoice();
  const { customers, getAllCustomers } = useClient();
  const { collections, getCollections } = useReceivedCollection();
  const { payments, getPayments } = usePaymentCompany();

  const { year } = useYear();
  const { tenant } = useTenant();

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    getAllCompanies();
    getAllCustomers();
    getCollections();
    getPayments();

    getPurchaseInvoiceByYear(year);
    getSalesInvoicesByYear(year);
  }, [year, tenant]);

  // Borçlar ve Alacaklar toplamını hesapla
  const totalAlacak = collections.reduce((sum, c) => sum + Number(c.price), 0);
  const totalBorc = payments.reduce((sum, p) => sum + Number(p.price), 0);

  const currentCompany = companies?.find((c) => c.schemaName === tenant);
  const companyDisplayName = currentCompany
    ? currentCompany.name
    : tenant?.toUpperCase();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* ÜST BAŞLIK */}
        <header className="flex justify-between items-end border-b border-gray-800 pb-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              {year} Mali Yılı -{" "}
              <span className="text-blue-500 font-mono">
                {companyDisplayName}
              </span>{" "}
              Çalışma Alanı Özeti
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Son Güncelleme
            </p>
            <p className="text-sm font-mono text-gray-300">
              {new Date().toLocaleString("tr-TR")}
            </p>
          </div>
        </header>

        {/* ANA İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Satın Alma Özet */}
          <div className="group bg-gray-900/40 border border-gray-800 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                İşlem Hacmi
              </span>
            </div>
            <h2 className="text-gray-400 font-medium">Satın Alma</h2>
            <p className="text-4xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors tracking-tight">
              {purchase.length}{" "}
              <span className="text-lg font-normal text-gray-600">Adet</span>
            </p>
          </div>

          {/* Satış Özet */}
          <div className="group bg-gray-900/40 border border-gray-800 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                Satış Gücü
              </span>
            </div>
            <h2 className="text-gray-400 font-medium">Satış Faturaları</h2>
            <p className="text-4xl font-black text-white mt-1 group-hover:text-emerald-400 transition-colors tracking-tight">
              {sales.length}{" "}
              <span className="text-lg font-normal text-gray-600">Adet</span>
            </p>
          </div>

          {/* Müşteri Özet */}
          <div className="group bg-gray-900/40 border border-gray-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                Portföy
              </span>
            </div>
            <h2 className="text-gray-400 font-medium">Müşteriler</h2>
            <p className="text-4xl font-black text-white mt-1 group-hover:text-purple-400 transition-colors tracking-tight">
              {customers.length}{" "}
              <span className="text-lg font-normal text-gray-600">Kayıt</span>
            </p>
          </div>

          {/* Finansal Durum Özet (Borç/Alacak Dengesi) */}
          <div className="bg-gray-900/60 border border-gray-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg
                className="w-24 h-24"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.001 8.001 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  Toplam Alacak
                </p>
                <p className="text-xl font-bold text-emerald-400 font-mono">
                  ₺ {totalAlacak.toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="border-t border-gray-800 pt-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  Toplam Borç
                </p>
                <p className="text-xl font-bold text-red-400 font-mono">
                  ₺ {totalBorc.toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HIZLI ERİŞİM KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <QuickLinkCard
            title="Satış Yönetimi"
            desc="Müşterilere fatura kesin, bekleyen ödemeleri takip edin ve satış performansınızı inceleyin."
            color="emerald"
            href="/faturalar"
          />

          <QuickLinkCard
            title="Satın Alma"
            desc="Tedarikçi faturalarını sisteme işleyin, stok girişlerini ve firma borçlarını yönetin."
            color="blue"
            href="/faturalar"
          />

          <QuickLinkCard
            title="Müşteri Paneli"
            desc="Müşteri kartlarını güncelleyin, adres ve vergi bilgilerini düzenleyerek CRM akışını yönetin."
            color="purple"
            href="/musteriler"
          />
        </div>
      </div>
    </div>
  );
}
