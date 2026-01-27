import { useFinancialLogic } from "./hooks/useFinancialLogic";
import FinancialForm from "./components/FinancialForm";
import FinancialEditModal from "./components/FinancialEditModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function CollectionPage() {
  const { state, handlers } = useFinancialLogic();
  const {
    type,
    editing,
    search,
    deleteTarget,
    openMenuId,
    addForm,
    editForm,
    filteredList,
    customers,
    year,
  } = state;

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Finansal İşlemler
            </h1>
            <p className="text-gray-400 mt-2">
              {year} Mali Yılı Tahsilat ve Ödeme Yönetimi
            </p>
          </div>
          <select
            value={type}
            onChange={(e) => handlers.setType(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-3 outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
          >
            <option value="received">⬇️ Alınan Tahsilatlar</option>
            <option value="payment">⬆️ Firmaya Ödemeler</option>
          </select>
        </div>

        {/* Ekleme Formu */}
        <FinancialForm
          type={type}
          addForm={addForm}
          setAddForm={handlers.setAddForm}
          handleAdd={handlers.handleAdd}
          customers={customers}
        />

        {/* Liste Tablosu */}
        <div className="space-y-6" ref={state.menuRef}>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              İşlem Geçmişi
            </h3>
            <input
              type="text"
              placeholder="Listede ara..."
              value={search}
              onChange={(e) => handlers.setSearch(e.target.value)}
              className="bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
            />
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Tarih
                    </th>
                    <th className="p-1 text-xs font-medium uppercase tracking-widest">
                      İşlem No
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Müşteri / Firma
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Açıklama
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                      Tutar
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-24">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-500/5 transition-all group"
                      >
                        <td className="p-5 text-gray-300 font-mono text-sm">
                          {handlers.formatDate(item.date)}
                        </td>
                        <td className="p-5 font-bold text-white max-w-[300px] truncate">
                          {item.fileNo}
                        </td>
                        <td className="p-5 font-bold text-white max-w-[300px] truncate">
                          {item.customer?.name}
                        </td>
                        <td className="p-5 text-gray-400 text-sm max-w-[250px] truncate">
                          {item.comment || "-"}
                        </td>
                        <td className="p-5 text-right">
                          <span
                            className={`text-lg font-bold font-mono ${
                              type === "received"
                                ? "text-emerald-400"
                                : "text-orange-400"
                            }`}
                          >
                            ₺{" "}
                            {Number(item.price).toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="p-5 text-center relative">
                          <button
                            onClick={() => handlers.toggleMenu(item.id)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-all"
                          >
                            ⋮
                          </button>
                          {openMenuId === item.id && (
                            <div className="absolute right-12 top-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-36 z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  handlers.handleEdit(item);
                                  handlers.setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-500/10 text-sm text-blue-400 flex items-center gap-2"
                              >
                                ✏️ Düzenle
                              </button>
                              <button
                                onClick={() => {
                                  handlers.setDeleteTarget(item);
                                  handlers.setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 border-t border-gray-800 flex items-center gap-2"
                              >
                                🗑️ Sil
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-20 text-center text-gray-600 italic"
                      >
                        Kayıt bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODALLAR */}
      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        onCancel={() => handlers.setDeleteTarget(null)}
        onConfirm={handlers.handleDelete}
      />

      <FinancialEditModal
        editing={editing}
        editForm={editForm}
        setEditForm={(val) => handlers.setEditForm(val)}
        onCancel={() => handlers.handleEdit(null)}
        onSave={handlers.handleSave}
        customers={customers}
      />
    </div>
  );
}
