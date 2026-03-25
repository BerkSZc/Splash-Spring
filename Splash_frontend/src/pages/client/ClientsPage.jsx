import { useClientLogic } from "./hooks/useClientLogic.js";
import ClientForm from "./components/ClientForm";
import ClientTable from "./components/ClientTable";
import StatementModal from "./components/StatementModal";
import ArchiveConfirmModal from "../../components/ArchiveConfirmModal.jsx";
import ContextMenu from "./components/ContextMenu";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import ClientEditModal from "./components/ClientEditModal.jsx";
import ClientViewModal from "./components/ClientViewModal.jsx";

export default function ClientsPage() {
  const { state, handlers } = useClientLogic();

  const selectedList = (
    Array.isArray(state.filteredCustomers) ? state.filteredCustomers : []
  ).filter((c) =>
    (Array.isArray(state.selectedCustomers)
      ? state.selectedCustomers
      : []
    ).includes(c.id),
  );

  return (
    <div className="min-h-screen w-full bg-[#030712] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. BÖLÜM: ÜST BAŞLIK VE ARAMA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => {
                handlers.setPage(0);
                handlers.setShowArchived(!state.showArchived);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                state.showArchived
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20"
              }`}
            >
              {state.showArchived ? "Aktif Listeye Dön" : "Arşivdekiler"}
            </button>

            {/* YENİ MÜŞTERİ EKLE BUTONU */}
            {!state.isOpen && (
              <button
                onClick={() => handlers.setIsOpen(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 shadow-2xl bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 animate-in fade-in zoom-in duration-300"
              >
                <span className="text-m">+</span> YENİ MÜŞTERİ
              </button>
            )}
          </div>
        </div>

        {/* 2. BÖLÜM: KAYIT VE GÜNCELLEME FORMU */}
        {state.isOpen && !state.editClient && (
          <ClientForm
            form={state.form || {}}
            formatNumber={state.formatNumber}
            handleChange={handlers.handleChange}
            handleSubmit={handlers.handleSubmit}
            onCancel={() => handlers.setIsOpen(false)}
          />
        )}
        <div className="flex justify-end items-center gap-3">
          <div className="flex bg-gray-900/40 p-1 rounded-2xl border border-gray-800">
            <button
              onClick={() => handlers.setSortDirection("desc")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                state.sortDirection === "desc"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title="En çok borcu olandan az olana"
            >
              📈 Borçlu
            </button>
            <button
              onClick={() => handlers.setSortDirection("asc")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                state.sortDirection === "asc"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title="Alacaklı olandan borçluya"
            >
              📉 Alacaklı
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={state?.search || ""}
              onChange={(e) => handlers.setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 bg-gray-900/40 border-2 border-gray-800 rounded-2xl w-full text-white focus:border-blue-500 transition-all outline-none"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-4 top-3.5"
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
        </div>

        {/* 3. BÖLÜM: MÜŞTERİ LİSTESİ (TABLO) */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              {state.showArchived ? "Arşiv Müşteriler" : "Aktif Müşteriler"}
            </h3>

            <button
              onClick={() => {
                handlers.setSelectionMode(!state.selectionMode);
                handlers.setSelectedCustomers([]);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                state.selectionMode
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {state.selectionMode
                ? `${state.selectedCustomers.length} Seçili`
                : "Birden fazla seç"}
            </button>
          </div>
          <ClientTable
            customers={state.filteredCustomers}
            selectedCustomers={state.selectedCustomers}
            onCheckboxChange={(id) => {
              if (state.selectionMode) {
                handlers.setSelectedCustomers((prev) =>
                  prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id],
                );
              } else {
                handlers.setSelectedCustomers((prev) =>
                  prev.includes(id) ? [] : [id],
                );
              }
            }}
            onContextMenu={(e, c) => handlers.handleContextMenu(e, c)}
            vouchers={state.vouchers}
          />
        </div>
      </div>

      {state.editClient && (
        <ClientEditModal
          form={state.form}
          setForm={handlers.setForm}
          onCancel={handlers.handleCancelEdit}
          onSave={handlers.handleSubmit}
          formatNumber={state.formatNumber}
        />
      )}

      {/* 4. BÖLÜM: MODALLAR VE KONTROLLER */}
      {state.showArchiveModal && (
        <ArchiveConfirmModal
          isOpen={state.showArchiveModal}
          action={state.archiveAction}
          onCancel={() => handlers.setShowArchiveModal(false)}
          onConfirm={() =>
            handlers.handleArchiveModalSubmit(state.pendingArchiveIds)
          }
          count={state.pendingArchiveIds.length}
        />
      )}

      {state.contextMenu && (
        <ContextMenu
          contextMenu={state.contextMenu}
          selectedCount={state.selectedCustomers.length}
          isAllArchived={
            selectedList.length > 0 && selectedList.every((c) => c.archived)
          }
          selectionMode={state.selectionMode}
          showArchived={state.showArchived}
          onClose={() => handlers.setContextMenu(null)}
          onEdit={(c) => {
            handlers.handleEdit(c);
            handlers.setContextMenu(null);
          }}
          onArchiveClick={() => {
            const ids = state.selectionMode
              ? state.selectedCustomers
              : [state.contextMenu.customer.id];
            handlers.setPendingArchiveIds(ids);
            handlers.setArchiveAction(
              state.showArchived ? "unarchive" : "archive",
            );
            handlers.setShowArchiveModal(true);
            handlers.setContextMenu(null);
          }}
          onOpenStatement={(c) => {
            handlers.handleOpenStatement(c);
            handlers.setContextMenu(null);
          }}
          onSelectedCustomer={handlers.setSelectedCustomers}
          onView={handlers.handleView}
        />
      )}

      {state.showPrintModal && (
        <StatementModal
          showPrintModal={state.showPrintModal}
          setShowPrintModal={handlers.setShowPrintModal}
          selectedCustomer={state.selectedCustomerForStatement}
          statementData={state.statementData}
          year={state.year}
        />
      )}

      {state.viewingClient && (
        <ClientViewModal
          customer={state.viewingClient}
          vouchers={state.vouchers}
          formatNumber={state.formatNumber}
          onClose={() => handlers.setViewingClient(null)}
        />
      )}

      {state.customerTotalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            onClick={() => handlers.setPage((p) => p - 1)}
            disabled={state.page === 0}
            className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            ← Önceki
          </button>
          <span className="text-gray-400 text-sm">
            {state.page + 1} / {state.customerTotalPages}
          </span>
          <button
            onClick={() => handlers.setPage((p) => p + 1)}
            disabled={state.page >= state.customerTotalPages - 1}
            className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
