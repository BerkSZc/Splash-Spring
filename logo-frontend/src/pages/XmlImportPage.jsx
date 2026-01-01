import { useRef, useState } from "react";
import { useImportXml } from "../../backend/store/useImportXml";

function XmlImportPage() {
  const purchaseInvoiceInputRef = useRef(null);
  const salesInvoiceInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const collectionInputRef = useRef(null);
  const payrollInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const {
    importPurchaseInvoice,
    importMaterials,
    importCustomers,
    importCollections,
    importSalesInvoice,
    importPayrolls,
  } = useImportXml();

  const upload = async (file, type) => {
    if (!file) return;

    setLoading(true);

    if (type === "invoice") {
      await importPurchaseInvoice(file);
    } else if (type === "materials") {
      await importMaterials(file);
    } else if (type === "customers") {
      await importCustomers(file);
    } else if (type === "cash") {
      await importCollections(file);
    } else if (type === "sales-invoice") {
      await importSalesInvoice(file);
    } else if (type === "payroll") {
      await importPayrolls(file);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        {/* ÜST BAŞLIK */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-blue-600/10 rounded-2xl text-blue-500 mb-2">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            XML Veri Aktarma Merkezi
          </h2>
          <p className="text-gray-400">
            Dış kaynaklı XML dosyalarınızı sisteme hızlıca entegre edin.
          </p>
        </div>

        {/* ANA PANEL */}
        <div className="bg-gray-900/40 border border-gray-800 p-8 rounded-[2.5rem] backdrop-blur-sm shadow-2xl space-y-4">
          {/* SATIN ALMA FATURA */}
          <input
            type="file"
            accept=".xml"
            ref={purchaseInvoiceInputRef}
            className="hidden"
            onChange={(e) => upload(e.target.files[0], "invoice")}
          />
          <button
            onClick={() => purchaseInvoiceInputRef.current.click()}
            disabled={loading}
            className="group w-full flex items-center justify-between bg-blue-600/10 hover:bg-blue-600 border border-blue-600/20 text-blue-400 hover:text-white p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-white/20 transition-colors">
                🛒
              </span>
              <span className="font-bold uppercase tracking-wider text-sm">
                {loading ? "Yükleniyor..." : "Satın Alma Fatura XML"}
              </span>
            </div>
            <svg
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
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

          {/* SATIŞ FATURASI */}
          <input
            type="file"
            accept=".xml"
            ref={salesInvoiceInputRef}
            className="hidden"
            onChange={(e) => upload(e.target.files[0], "sales-invoice")}
          />
          <button
            onClick={() => salesInvoiceInputRef.current.click()}
            disabled={loading}
            className="group w-full flex items-center justify-between bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-600/20 text-emerald-400 hover:text-white p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-white/20 transition-colors">
                💰
              </span>
              <span className="font-bold uppercase tracking-wider text-sm">
                {loading ? "Yükleniyor..." : "Satış Faturası XML"}
              </span>
            </div>
            <svg
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
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
          {/* ÇEK VE SENET İŞLEMLERİ - YENİ */}
          <input
            type="file"
            accept=".xml"
            ref={payrollInputRef}
            className="hidden"
            onChange={(e) => upload(e.target.files[0], "payroll")}
          />
          <button
            onClick={() => payrollInputRef.current.click()}
            disabled={loading}
            className="group w-full flex items-center justify-between bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 text-purple-400 hover:text-white p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-white/20 transition-colors">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              <span className="font-bold uppercase tracking-wider text-sm text-left leading-tight">
                {loading ? "Yükleniyor..." : "Çek ve Senet XML"}
              </span>
            </div>
            <svg
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
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

          <div className="grid grid-cols-2 gap-4">
            {/* MALZEME */}
            <input
              type="file"
              accept=".xml"
              ref={materialInputRef}
              className="hidden"
              onChange={(e) => upload(e.target.files[0], "materials")}
            />
            <button
              onClick={() => materialInputRef.current.click()}
              disabled={loading}
              className="group flex flex-col items-center justify-center bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl transition-all duration-300 active:scale-[0.98]"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                📦
              </span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">
                Malzeme XML
              </span>
            </button>

            {/* CARİ */}
            <input
              type="file"
              accept=".xml"
              ref={customerInputRef}
              className="hidden"
              onChange={(e) => upload(e.target.files[0], "customers")}
            />
            <button
              onClick={() => customerInputRef.current.click()}
              disabled={loading}
              className="group flex flex-col items-center justify-center bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl transition-all duration-300 active:scale-[0.98]"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                👥
              </span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">
                Cari XML
              </span>
            </button>
          </div>

          {/* KASA İŞLEMLERİ */}
          <input
            type="file"
            accept=".xml"
            ref={collectionInputRef}
            className="hidden"
            onChange={(e) => upload(e.target.files[0], "cash")}
          />
          <button
            onClick={() => collectionInputRef.current.click()}
            disabled={loading}
            className="group w-full flex items-center justify-between bg-orange-600/10 hover:bg-orange-600 border border-orange-600/20 text-orange-400 hover:text-white p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="p-2 bg-orange-600/20 rounded-lg group-hover:bg-white/20 transition-colors">
                🏦
              </span>
              <span className="font-bold uppercase tracking-wider text-sm text-left leading-tight">
                {loading ? "Yükleniyor..." : "Kasa İşlemleri XML"}
              </span>
            </div>
            <svg
              className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
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

        {/* ALT BİLGİ */}
        <p className="text-center text-gray-500 text-xs tracking-widest uppercase">
          Lütfen sadece LOGO uyumlu XML dosyalarını kullanın.
        </p>
      </div>
    </div>
  );
}

export default XmlImportPage;
