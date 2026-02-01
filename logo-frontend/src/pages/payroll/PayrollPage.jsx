import { usePayrollLogic } from "./hooks/usePayrollLogic";
import PayrollForm from "./components/PayrollForm";
import PayrollTable from "./components/PayrollTable";

export default function PayrollPage() {
  const { state, handlers, refs } = usePayrollLogic();
  const {
    type,
    editing,
    search,
    form,
    currentTheme,
    filteredList,
    totalAmount,
    customers,
    year,
    payrollType,
  } = state;

  return (
    <div
      className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12 font-sans"
      ref={refs.formRef}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Üst Bilgi Paneli */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Portföy Yönetimi
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-blue-400">
                {year}
              </span>
              Mali Yılı Evrak Takibi
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-900/60 p-2 rounded-2xl border border-gray-800">
            <div className="px-4 py-2">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">
                Filtrelenen Toplam
              </p>
              <p
                className={`text-xl font-mono font-bold ${currentTheme.color}`}
              >
                ₺{" "}
                {totalAmount.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="h-10 w-[1px] bg-gray-800"></div>
            <select
              value={type}
              onChange={(e) => handlers.setType(e.target.value)}
              className="bg-transparent text-white rounded-xl px-4 py-2 outline-none font-bold cursor-pointer"
            >
              <option className="bg-gray-900" value="cheque_in">
                ⬇️ Çek Girişi
              </option>
              <option className="bg-gray-900" value="cheque_out">
                ⬆️ Çek Çıkışı
              </option>
              <option className="bg-gray-900" value="bond_in">
                📝 Senet Girişi
              </option>
              <option className="bg-gray-900" value="bond_out">
                📤 Senet Çıkışı
              </option>
            </select>
          </div>
        </div>

        <PayrollForm
          form={form}
          setForm={handlers.setForm}
          currentTheme={currentTheme}
          editing={editing}
          onSubmit={handlers.handleSubmit}
          onReset={handlers.resetForm}
          customers={customers}
        />

        <PayrollTable
          filteredList={filteredList}
          currentTheme={currentTheme}
          search={search}
          setSearch={handlers.setSearch}
          onEdit={handlers.handleEditClick}
          onDelete={handlers.openDeleteModel}
          formatDate={handlers.formatDate}
        />

        {state.deleteTarget && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[110] backdrop-blur-md">
            <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Faturayı Sil
              </h2>
              <p className="mb-8 text-gray-400">
                <b>{state.deleteTarget.fileNo}</b> numaralı {payrollType} kalıcı
                olarak silinecektir. Emin misiniz?
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
      </div>
    </div>
  );
}
