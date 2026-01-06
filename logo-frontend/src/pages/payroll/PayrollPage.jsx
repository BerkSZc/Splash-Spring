import { usePayrollLogic } from "./hooks/usePayrollLogic";
import PayrollForm from "./components/PayrollForm";
import PayrollTable from "./components/PayrollTable";

export default function PayrollPage() {
  const { state, handlers } = usePayrollLogic();
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
  } = state;

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12 font-sans">
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
              <option className="bg-gray-900" value="note_in">
                📝 Senet Girişi
              </option>
              <option className="bg-gray-900" value="note_out">
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
          onDelete={handlers.handleDelete}
        />
      </div>
    </div>
  );
}
