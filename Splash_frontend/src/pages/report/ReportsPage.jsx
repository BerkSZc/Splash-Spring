import { useState } from "react";
import { useReportData } from "./hooks/useReportData.js";
import { ReportTable } from "./components/ReportTable.jsx";
import { KDVSummary } from "./components/KDVSummary.jsx";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const { data, year } = useReportData();

  const tabs = [
    { id: "summary", label: "📊 KDV ANALİZ ÖZETİ" },
    { id: "purchases", label: "🛒 ALIMLAR TABLOSU" },
    { id: "sales", label: "💰 SATIŞLAR TABLOSU" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-6 lg:p-12">
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-black tracking-tighter uppercase">
          Finansal Raporlar
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-1">
          {year} Çalışma Dönemi Analizi
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 backdrop-blur-xl min-h-[400px]">
          {activeTab === "summary" && <KDVSummary data={data} />}
          {activeTab === "purchases" && (
            <ReportTable
              title="Alımlar"
              items={data.purchases}
              color="emerald"
            />
          )}
          {activeTab === "sales" && (
            <ReportTable title="Satışlar" items={data.sales} color="orange" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
