import { useInvoicePageLogic } from "./hooks/useInvoicePageLogic.js";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceEditModal from "./components/InvoiceEditModal";
import InvoicePrintPreview from "./components/InvoicePrintPreview";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import InvoiceViewModal from "./components/InvoiceViewModal.jsx";

export default function InvoicePage() {
  const { state, handlers } = useInvoicePageLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-7xl mx-auto space-y-10">
        {/* BAŞLIK VE TİP SEÇİMİ */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fatura Yönetimi
            </h1>
            <p className="text-gray-400 mt-2">
              {state?.year || ""} Mali Yılı - Kayıtlı Faturalar
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SIRALAMA SEÇİMİ */}
            <select
              value={state.sortOrder}
              onChange={(e) => handlers.setSortOrder(e.target.value)}
              className="bg-gray-900/40 border-2 border-gray-800 text-gray-300 text-sm rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-800/60"
            >
              <option value="desc">🗓️ En Yeni</option>
              <option value="asc">🗓️ En Eski</option>
            </select>

            <select
              value={state?.invoiceType || ""}
              onChange={(e) => handlers.setInvoiceType(e.target.value)}
              className="bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-3 font-bold cursor-pointer focus:border-blue-500 transition-all outline-none"
            >
              <option value="purchase">🛒 Satın Alma Faturaları</option>
              <option value="sales">💰 Satış Faturaları</option>
            </select>
          </div>
        </div>

        {/* ARAMA */}
        <div className="relative">
          <input
            type="text"
            placeholder="Fatura no, müşteri adı veya tarihe göre ara..."
            value={state?.searchTerm || ""}
            onChange={(e) => handlers.setSearchTerm(e.target.value)}
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

        {/* TABLO */}
        <InvoiceTable
          invoices={
            Array.isArray(state.filteredInvoices) ? state?.filteredInvoices : []
          }
          onEdit={handlers.handleEdit}
          onDelete={handlers.setDeleteTarget}
          onPrint={handlers.setPrintItem}
          year={state.year}
          formatDateToTR={state.formatDateToTR}
          isLoading={state.isLoading}
          selectedInvoiceId={state.selectedInvoiceId}
          contextMenu={state.contextMenu}
          setContextMenu={handlers.setContextMenu}
          onContextMenu={handlers.handleContextMenu}
          onSelectInvoice={handlers.handleSelectInvoice}
          onView={handlers.setViewingInvoice}
        />

        {/* MODALLAR */}
        {state?.editingInvoice && (
          <InvoiceEditModal
            form={state.form}
            formatNumber={state.formatNumber}
            onItemChange={handlers.handleItemChange}
            setForm={handlers.setForm}
            invoiceType={state.invoiceType}
            materials={state.materials}
            customers={state.customers}
            onRateChange={handlers.handleRateChange}
            onCancel={() => {
              handlers.setEditingInvoice(null);
              handlers.setForm(null);
            }}
            onSave={handlers.handleSave}
            modalTotals={state.modalTotals}
            addItem={handlers.addItem}
            removeItem={handlers.removeItem}
            handlePriceSelect={handlers.handlePriceSelect}
          />
        )}

        {state?.printItem && (
          <InvoicePrintPreview
            printItem={state.printItem}
            onCancel={() => handlers.setPrintItem(null)}
            onExecutePrint={handlers.executePrint}
          />
        )}

        {state.viewingInvoice && (
          <InvoiceViewModal
            invoice={state.viewingInvoice}
            onClose={() => handlers.setViewingInvoice(null)}
            formatNumber={state.formatNumber}
            formatDate={state.formatDateToTR}
          />
        )}

        {/* SİLME ONAY MODALI */}
        {state?.deleteTarget && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-[9999] backdrop-blur-md">
            <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Faturayı Sil
              </h2>
              <p className="mb-8 text-gray-400">
                <b>{state?.deleteTarget?.fileNo || ""}</b> numaralı fatura
                kalıcı olarak silinecektir. Emin misiniz?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handlers.setDeleteTarget(null)}
                  className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handlers.confirmDelete}
                  className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}
        {state.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <button
              onClick={() => handlers.setPage((p) => p - 1)}
              disabled={state.page === 0}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold disabled:opacity-30 hover:bg-gray-700 transition-all"
            >
              ← Önceki
            </button>
            <span className="text-gray-400 text-sm">
              {state.page + 1} / {state.totalPages}
            </span>
            <button
              onClick={() => handlers.setPage((p) => p + 1)}
              disabled={state.page >= state.totalPages - 1}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold disabled:opacity-30 hover:bg-gray-700 transition-all"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
