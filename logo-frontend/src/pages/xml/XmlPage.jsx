import { useXmlImportLogic } from "./hooks/useXmlImportLogic";
import { ImportButton } from "./components/ImportButton";

function XmlPage() {
  const { state, refs, handlers } = useXmlImportLogic();

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
          {/* HIDDEN INPUTS */}
          <input
            type="file"
            accept=".xml"
            ref={refs.purchaseInvoiceInputRef}
            className="hidden"
            onChange={(e) => handlers.upload(e.target.files[0], "invoice")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.salesInvoiceInputRef}
            className="hidden"
            onChange={(e) =>
              handlers.upload(e.target.files[0], "sales-invoice")
            }
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.payrollInputRef}
            className="hidden"
            onChange={(e) => handlers.upload(e.target.files[0], "payroll")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.materialInputRef}
            className="hidden"
            onChange={(e) => handlers.upload(e.target.files[0], "materials")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.customerInputRef}
            className="hidden"
            onChange={(e) => handlers.upload(e.target.files[0], "customers")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.collectionInputRef}
            className="hidden"
            onChange={(e) => handlers.upload(e.target.files[0], "cash")}
          />

          {/* BUTTONS */}
          <ImportButton
            label="Satın Alma Fatura XML"
            icon="🛒"
            variant="blue"
            disabled={state.loading}
            onClick={() => refs.purchaseInvoiceInputRef.current.click()}
          />

          <ImportButton
            label="Satış Faturası XML"
            icon="💰"
            variant="emerald"
            disabled={state.loading}
            onClick={() => refs.salesInvoiceInputRef.current.click()}
          />

          <ImportButton
            label="Çek ve Senet XML"
            icon={
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
            }
            variant="purple"
            disabled={state.loading}
            onClick={() => refs.payrollInputRef.current.click()}
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => refs.materialInputRef.current.click()}
              disabled={state.loading}
              className="group flex flex-col items-center justify-center bg-gray-800/50 hover:bg-gray-700 border border-gray-700 p-6 rounded-2xl transition-all duration-300 active:scale-[0.98]"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                📦
              </span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest text-center">
                Malzeme XML
              </span>
            </button>

            <button
              onClick={() => refs.customerInputRef.current.click()}
              disabled={state.loading}
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

          <ImportButton
            label="Kasa İşlemleri XML"
            icon="🏦"
            variant="orange"
            disabled={state.loading}
            onClick={() => refs.collectionInputRef.current.click()}
          />
        </div>

        <p className="text-center text-gray-500 text-xs tracking-widest uppercase">
          Lütfen sadece LOGO uyumlu XML dosyalarını kullanın.
        </p>
      </div>
    </div>
  );
}

export default XmlPage;
