import { useClientLogic } from "./hooks/useClientLogic.js";
import ClientForm from "./components/ClientForm";
import ClientTable from "./components/ClientTable";
import StatementModal from "./components/StatementModal";
import ArchiveConfirmModal from "./components/ArchiveConfirmModal";
import ContextMenu from "./components/ContextMenu";

export default function ClientsPage() {
  const { state, handlers, refs } = useClientLogic();

  // Seçili olan müşterilerin listesi (Arşiv aksiyonu için)
  const selectedList = state.filteredCustomers.filter((c) =>
    state.selectedCustomers.includes(c.id),
  );

  return (
    <div className="min-h-screen w-full bg-[#030712] text-gray-100 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. BÖLÜM: ÜST BAŞLIK VE ARAMA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Müşteri Yönetimi
            </h1>
            <p className="text-gray-400 text-lg">
              Portföyünüzü ve bakiye durumlarını kontrol edin.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={state.search}
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
            <button
              onClick={() => handlers.setShowArchived(!state.showArchived)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                state.showArchived
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20"
              }`}
            >
              {state.showArchived ? "Aktif Listeye Dön" : "Arşivdekiler"}
            </button>
          </div>
        </div>

        {/* 2. BÖLÜM: KAYIT VE GÜNCELLEME FORMU */}
        <ClientForm
          form={state.form}
          editClient={state.editClient}
          handleChange={handlers.handleChange}
          handleSubmit={handlers.handleSubmit}
          handleCancelEdit={handlers.handleCancelEdit}
          formRef={refs.formRef}
        />

        {/* 3. BÖLÜM: MÜŞTERİ LİSTESİ (TABLO) */}
        <div className="space-y-6">
          <ClientTable
            customers={state.filteredCustomers}
            selectedCustomers={state.selectedCustomers}
            openMenuId={state.openMenuId}
            onCheckboxChange={(id) =>
              handlers.setSelectedCustomers((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id],
              )
            }
            onToggleMenu={(id) =>
              handlers.setOpenMenuId(state.openMenuId === id ? null : id)
            }
            onContextMenu={(e, c) => {
              e.preventDefault();
              handlers.setContextMenu({
                x: e.clientX,
                y: e.clientY,
                customer: c,
              });
              if (!state.selectedCustomers.includes(c.id))
                handlers.setSelectedCustomers([c.id]);
            }}
            onEdit={handlers.handleEdit}
            onOpenStatement={handlers.handleOpenStatement}
            onArchiveToggle={handlers.handleArchiveToggle}
          />
        </div>
      </div>

      {/* 4. BÖLÜM: MODALLAR VE KONTROLLER */}
      <ArchiveConfirmModal
        isOpen={state.showArchiveModal}
        count={state.selectedCustomers.length}
        action={state.archiveAction}
        onCancel={() => handlers.setShowArchiveModal(false)}
        onConfirm={handlers.handleArchiveModalSubmit}
      />

      <ContextMenu
        contextMenu={state.contextMenu}
        selectedCount={state.selectedCustomers.length}
        isAllArchived={selectedList.every((c) => c.archived)}
        onClose={() => handlers.setContextMenu(null)}
        onEdit={(c) => {
          handlers.handleEdit(c);
          handlers.setContextMenu(null);
        }}
        onArchiveClick={() => {
          handlers.setArchiveAction(
            selectedList.every((c) => c.archived) ? "unarchive" : "archive",
          );
          handlers.setShowArchiveModal(true);
          handlers.setContextMenu(null);
        }}
      />

      <StatementModal
        showPrintModal={state.showPrintModal}
        setShowPrintModal={handlers.setShowPrintModal}
        selectedCustomer={state.selectedCustomerForStatement}
        statementData={state.statementData}
        year={state.year}
      />
    </div>
  );
}
