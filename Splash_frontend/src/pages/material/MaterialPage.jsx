import { useMaterialLogic } from "./hooks/useMaterialLogic.js";
import { MaterialCard } from "./components/MaterialCard";
import { MaterialFormCard } from "./components/MaterialFormCard";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import MaterialEditModal from "./components/MaterialEditModal.jsx";
import { MaterialContextMenu } from "./components/MaterialContextMenu.jsx";
import ArchiveConfirmModal from "../../components/ArchiveConfirmModal.jsx";

export default function MaterialPage() {
  const { state, refs, handlers } = useMaterialLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* BAŞLIK */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Malzeme Yönetimi
            </h1>
            <p className="text-gray-400">
              Sistemdeki ürün ve hammadde tanımlarını yönetin.
            </p>
          </div>

          {!state.isOpen && (
            <button
              onClick={() => handlers.setIsOpen(true)}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 shadow-2xl bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 animate-in fade-in zoom-in duration-300"
            >
              <span className="text-lg">+</span> YENİ MALZEME EKLE
            </button>
          )}
        </div>

        <hr className="border-gray-800/50" />

        {/* FORM KARTI (Parçalanmış Bileşen) */}
        {state.isOpen && !state.editId && (
          <MaterialFormCard
            formRef={refs.formRef}
            editId={state?.editId}
            form={state?.form || []}
            onChange={handlers.handleChange}
            onSubmit={handlers.handleSubmit}
            onCancel={handlers.handleCancel}
          />
        )}

        {state.isOpen && state.editId && (
          <MaterialEditModal
            form={state.form}
            onChange={handlers.handleChange}
            onSave={handlers.handleSubmit}
            onCancel={handlers.handleCancel}
          />
        )}

        {/* LİSTE ALANI */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                {state.showArchived
                  ? "Arşivlenmiş Malzemeler"
                  : "Kayıtlı Malzemeler"}
              </h3>

              <button
                onClick={() => handlers.handleShowArchived(!state.showArchived)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  state.showArchived
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30"
                }`}
              >
                {state.showArchived ? "Aktif Liste" : "Arşiv"}
              </button>

              <button
                onClick={() => {
                  handlers.setSelectionMode(!state.selectionMode);
                  handlers.setSelectedIds([]);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  state.selectionMode
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-gray-800 text-gray-400 border-gray-700"
                }`}
              >
                {state.selectionMode
                  ? `${state.selectedIds.length} Seçili`
                  : "Birden fazla seç"}
              </button>
            </div>
            {/* ARAMA ÇUBUĞU */}
            <div className="relative">
              <input
                type="text"
                placeholder="Malzeme ara..."
                className="bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 pl-10 text-sm focus:border-blue-500 outline-none transition-all w-64"
                value={state.search}
                onChange={(e) => handlers.handleSearch(e.target.value)}
              />
              <svg
                className="w-4 h-4 text-gray-500 absolute left-3 top-3"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(state.filteredMaterials) &&
            state.filteredMaterials.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
                <p className="text-gray-500 italic">
                  Aranan kritere uygun malzeme bulunamadı.
                </p>
              </div>
            ) : (
              (Array.isArray(state.filteredMaterials)
                ? state.filteredMaterials
                : []
              ).map((item) => (
                <MaterialCard
                  key={item.id}
                  item={item || []}
                  deleteConfirmId={state.deleteConfirmId}
                  selectionMode={state.selectionMode}
                  selectedIds={state.selectedIds}
                  setDeleteConfirmId={handlers.setDeleteConfirmId}
                  onDelete={handlers.handleDelete}
                  confirmOpen={state.confirmOpen}
                  menuItemId={state.menuItemId}
                  setConfirmOpen={handlers.setConfirmOpen}
                  setMenuItemId={handlers.setMenuItemId}
                  onContextMenu={handlers.handleContextMenu}
                  toggleSelectId={handlers.toggleSelectId}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {state.contextMenu && (
        <MaterialContextMenu
          contextMenu={state.contextMenu}
          selectionMode={state.selectionMode}
          showArchived={state.showArchived}
          onEdit={handlers.handleEdit}
          onClose={() => handlers.setContextMenu(null)}
          setArchiveTargetId={handlers.setArchiveTargetId}
          setMenuItemId={handlers.setMenuItemId}
          setConfirmOpen={handlers.setConfirmOpen}
          setDeleteConfirmId={handlers.setDeleteConfirmId}
          setArchiveAction={handlers.setArchiveAction}
          setArchiveConfirmOpen={handlers.setArchiveConfirmOpen}
        />
      )}

      {state.archiveConfirmOpen && (
        <ArchiveConfirmModal
          isOpen={state.archiveConfirmOpen}
          entityName="malzeme"
          action={state.archiveAction}
          onCancel={() => {
            handlers.setArchiveConfirmOpen(false);
            handlers.setMenuItemId(null);
            handlers.setSelectionMode(false);
            handlers.setSelectedIds([]);
          }}
          onConfirm={
            state.selectionMode
              ? handlers.handleBulkArchive
              : handlers.handleArchive
          }
          count={state.selectionMode ? state.selectedIds.length : 1}
        />
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
  );
}
