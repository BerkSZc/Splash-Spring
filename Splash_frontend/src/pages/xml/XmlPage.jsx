import { useXmlImportLogic } from "./hooks/useXmlImportLogic";
import { ImportButton } from "./components/ImportButton";

function XmlPage() {
  const { state, refs, handlers } = useXmlImportLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12 relative">
      {/* SAĞ ÜST MOD SEÇİCİ */}
      <div className="absolute top-8 right-8 flex p-1 bg-gray-900 border border-gray-800 rounded-xl z-50">
        <button
          onClick={() => handlers.setViewMode("import")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            state.viewMode === "import"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          İÇE AKTAR (IMPORT)
        </button>
        <button
          onClick={() => handlers.setViewMode("export")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            state.viewMode === "export"
              ? "bg-orange-600 text-white shadow-lg"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          DIŞA AKTAR (EXPORT)
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-8 pt-16">
        {/* ÜST BAŞLIK */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            XML Veri {state.viewMode === "import" ? "Aktarma" : "Çıkartma"}{" "}
            Merkezi
          </h2>
          <p className="text-gray-400">
            {state.viewMode === "import"
              ? "Dış kaynaklı XML dosyalarınızı sisteme hızlıca entegre edin."
              : `${state.year} yılına ait verilerinizi XML olarak indirin.`}
          </p>
        </div>

        {/* ANA PANEL */}
        <div
          className={`bg-gray-900/40 border p-8 rounded-[2.5rem] backdrop-blur-sm shadow-2xl space-y-4 transition-all duration-500 ${
            state.viewMode === "import"
              ? "border-gray-800"
              : "border-orange-900/30"
          }`}
        >
          {/* HIDDEN INPUTS */}
          <input
            type="file"
            accept=".xml"
            ref={refs.purchaseInvoiceInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "invoice")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.salesInvoiceInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "sales")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.payrollInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "payrolls")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.materialInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "materials")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.customerInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "customers")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.collectionInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "collections")}
          />
          <input
            type="file"
            accept=".xml"
            ref={refs.voucherInputRef}
            className="hidden"
            onChange={(e) => handlers.handleFileChange(e, "vouchers")}
          />

          {/* BUTTONS */}
          <ImportButton
            label={`Satın Alma Fatura ${state.viewMode === "import" ? "Yükle" : "İndir"}`}
            icon={state.viewMode === "import" ? "🛒" : "📥"}
            variant={state.viewMode === "import" ? "blue" : "orange"}
            disabled={state.loading}
            onClick={() => handlers.handleAction("invoice")}
          />

          <ImportButton
            label={`Satış Fatura ${state.viewMode === "import" ? "Yükle" : "İndir"} `}
            icon="💰"
            variant={state.viewMode === "import" ? "emerald" : "orange"}
            disabled={state.loading}
            onClick={() => handlers.handleAction("sales")}
          />

          <ImportButton
            label={`Devir Bakiyesi XML ${state.viewMode === "import" ? "İçeri Aktar" : "Dışarı Aktar"}`}
            icon="📂"
            variant="dark-green"
            disabled={state.loading}
            onClick={() => handlers.handleAction("vouchers")}
          />

          <ImportButton
            label={`Çek ve Senet XML ${state.viewMode === "import" ? "İçeri Aktar" : "Dışarı Aktar"}`}
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
            onClick={() => handlers.handleAction("payrolls")}
          />

          <div className="grid grid-cols-2 gap-4">
            <ImportButton
              label={`Malzeme XML ${state.viewMode === "import" ? "İçeri Aktar" : "Dışarı Aktar"}`}
              icon="📦"
              variant="blue"
              disabled={state.loading}
              onClick={() => handlers.handleAction("materials")}
            />

            <ImportButton
              label={`Cari XML ${state.viewMode === "import" ? "İçeri Aktar" : "Dışarı Aktar"}`}
              icon="👥"
              variant="red"
              disabled={state.loading}
              onClick={() => handlers.handleAction("customers")}
            />
          </div>

          <ImportButton
            label={`Kasa İşlemleri XML ${state.viewMode === "import" ? "İçeri Aktar" : "Dışarı Aktar"}`}
            icon="🏦"
            variant="orange"
            disabled={state.loading}
            onClick={() => handlers.handleAction("collections")}
          />
        </div>
      </div>
    </div>
  );
}

export default XmlPage;
