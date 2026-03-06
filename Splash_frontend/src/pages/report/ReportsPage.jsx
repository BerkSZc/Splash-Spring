import { useState } from "react";
import { useReportData } from "./hooks/useReportData.js";
import { ReportTable } from "./components/ReportTable.jsx";
import { KDVSummary } from "./components/KDVSummary.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import BalanceStatusReport from "./components/BalanceStatusReport.jsx";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("kdv_analysis");
  const [activeTab, setActiveTab] = useState("summary");
  const {
    data,
    year,
    isLoading,
    showArchived,
    setShowArchived,
    setSortDirection,
    sortDirection,
  } = useReportData(reportType);

  // Rapor türü seçim seçenekleri
  const reportOptions = [
    { id: "kdv_analysis", label: "📊 KDV ANALİZ RAPORLARI" },
    { id: "balance_status", label: "📑 BORÇ/ALACAK DURUM RAPORU" },
  ];

  // KDV Raporu alt sekmeleri
  const kdvTabs = [
    { id: "summary", label: "📊 KDV ANALİZ ÖZETİ" },
    { id: "purchases", label: "🛒 ALIMLAR TABLOSU" },
    { id: "sales", label: "💰 SATIŞLAR TABLOSU" },
  ];

  const handleReportChange = (e) => {
    setReportType(e.target.value);
    setActiveTab("summary");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-6 lg:p-12">
      {/* YÜKLEME EKRANI */}
      {isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veriler analiz ediliyor, lütfen bekleyiniz..."
        />
      )}

      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Finansal Raporlar
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-1">
            {year} Çalışma Dönemi Analizi
          </p>
        </div>

        {/* SAĞ ÜSTTEKİ RAPOR SEÇİMİ */}
        <div className="relative group">
          <select
            value={reportType}
            onChange={handleReportChange}
            className="appearance-none bg-gray-900 border-2 border-gray-800 text-blue-400 text-sm font-bold rounded-2xl pl-6 pr-12 py-4 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-xl ring-0 focus:ring-0"
          >
            {reportOptions?.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className="bg-gray-900 text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ALT SEKMELER: Sadece KDV Analizi seçiliyse görünür */}
        {reportType === "kdv_analysis" && (
          <div className="flex p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
            {kdvTabs?.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ANA İÇERİK ALANI */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 backdrop-blur-xl min-h-[500px] shadow-2xl">
          {reportType === "kdv_analysis" ? (
            <>
              {activeTab === "summary" && <KDVSummary data={data || []} />}
              {activeTab === "purchases" && (
                <ReportTable
                  title="Alımlar"
                  items={data?.purchases || []}
                  color="emerald"
                />
              )}
              {activeTab === "sales" && (
                <ReportTable
                  title="Satışlar"
                  items={data?.sales || []}
                  color="orange"
                />
              )}
            </>
          ) : (
            /* BORÇ / ALACAK DURUM RAPORU */
            <BalanceStatusReport
              items={data.balanceStatus || []}
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              setSortDirection={setSortDirection}
              sortDirection={sortDirection}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
