import { useFinancialLogic } from "./hooks/useFinancialLogic";
import FinancialForm from "./components/FinancialForm";
import FinancialEditModal from "./components/FinancialEditModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import FinancialTable from "./components/FinancialTable.jsx";
import ContextMenu from "./components/ContextMenu.jsx";

export default function CollectionPage() {
  const { state, handlers } = useFinancialLogic();
  const {
    type,
    editing,
    deleteTarget,
    addForm,
    editForm,
    filteredList,
    customers,
    year,
  } = state;

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Finansal İşlemler
            </h1>
            <p className="text-gray-400 mt-2">
              {year || ""} Mali Yılı Tahsilat ve Ödeme Yönetimi
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={type || ""}
              onChange={(e) => handlers.setType(e.target.value)}
              className="bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-3 outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
            >
              <option value="received">⬇️ Alınan Tahsilatlar</option>
              <option value="payment">⬆️ Firmaya Ödemeler</option>
            </select>
            {!state.isOpen && (
              <button
                onClick={() => handlers.setIsOpen(!state.isOpen)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 shadow-2xl ${
                  state.isOpen
                    ? "bg-gray-800 text-gray-400 border border-gray-700"
                    : type === "received"
                      ? "bg-emerald-600 text-white shadow-emerald-600/20"
                      : "bg-blue-600 text-white shadow-blue-600/20"
                }`}
              >
                <span className="text-m">+</span> YENİ İŞLEM
              </button>
            )}
          </div>
        </div>

        {/* Ekleme Formu */}
        {state.isOpen && (
          <FinancialForm
            type={type}
            addForm={addForm}
            setAddForm={handlers.setAddForm}
            handleAdd={handlers.handleAdd}
            customers={customers}
            onCancel={() => handlers.setIsOpen(false)}
          />
        )}

        {/* Liste Tablosu */}

        <FinancialTable
          filteredList={filteredList}
          type={type}
          selectedId={state.selectedId}
          search={state.search}
          sortOrder={state.sortOrder}
          onSelectRow={handlers.handleSelectRow}
          onContextMenu={handlers.setContextMenu}
          formatDate={handlers.formatDate}
          setSearch={handlers.setSearch}
          setSortOrder={handlers.setSortOrder}
        />
      </div>

      {/* MODALLAR */}
      {deleteTarget && (
        <DeleteConfirmModal
          deleteTarget={deleteTarget}
          onCancel={() => handlers.setDeleteTarget(null)}
          onConfirm={handlers.handleDelete}
        />
      )}

      {editing && (
        <FinancialEditModal
          editing={editing}
          editForm={editForm}
          setEditForm={(val) => handlers.setEditForm(val)}
          onCancel={() => handlers.handleEdit(null)}
          onSave={handlers.handleSave}
          customers={customers}
        />
      )}
      <ContextMenu
        contextMenu={state.contextMenu}
        onEdit={handlers.handleEdit}
        onDelete={handlers.setDeleteTarget}
        onClose={() => handlers.setContextMenu(null)}
      />
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
