import { useEffect, useState } from "react";
import { useClient } from "../../backend/store/useClient.js";
import { useYear } from "../context/YearContext.jsx";
import { usePayroll } from "../../backend/store/usePayroll.js";

export default function PayrollTransactionPage() {
  const { customers, getAllCustomers } = useClient();
  const { year } = useYear();
  const { payrolls, addCheque, editCheque, deleteCheque, getPayrollByYear } =
    usePayroll();

  const [type, setType] = useState("cheque_in");
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().slice(0, 10),
    expiredDate: new Date().toISOString().slice(0, 10),
    customerId: "",
    amount: "",
    fileNo: "",
    bankName: "",
    bankBranch: "",
    comment: "",
  });

  useEffect(() => {
    if (year) {
      getAllCustomers();
      getPayrollByYear(year);
    }
  }, [year, getPayrollByYear, getAllCustomers]);

  const getTheme = () => {
    switch (type) {
      case "cheque_in":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500",
          label: "Çek Girişi",
          icon: "⬇️",
        };
      case "cheque_out":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500",
          label: "Çek Çıkışı",
          icon: "⬆️",
        };
      case "note_in":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500",
          label: "Senet Girişi",
          icon: "📝",
        };
      case "note_out":
        return {
          color: "text-purple-400",
          bg: "bg-purple-500",
          label: "Senet Çıkışı",
          icon: "📤",
        };
      default:
        return {
          color: "text-blue-400",
          bg: "bg-blue-500",
          label: "İşlem",
          icon: "💰",
        };
    }
  };

  const currentTheme = getTheme();

  const filteredList = (payrolls || []).filter((item) => {
    const isCheque = type.includes("cheque");
    const isInput = type.includes("_in");
    const typeMatch = isCheque
      ? item.payrollType === "CHEQUE"
      : item.payrollType === "BOND";
    const modelMatch = isInput
      ? item.payrollModel === "INPUT"
      : item.payrollModel === "OUTPUT";

    return (
      typeMatch &&
      modelMatch &&
      (item.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.fileNo?.toLowerCase().includes(search.toLowerCase()) ||
        item.bankName?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Toplam Tutar Hesaplama
  const totalAmount = filteredList.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      payrollType: type.includes("cheque") ? "CHEQUE" : "BOND",
      payrollModel: type.includes("_in") ? "INPUT" : "OUTPUT",
    };

    if (editing) {
      await editCheque(editing.id, payload);
    } else {
      await addCheque(form.customerId, payload);
    }
    resetForm();
    getPayrollByYear(year);
  };

  const resetForm = () => {
    setForm({
      transactionDate: new Date().toISOString().slice(0, 10),
      expiredDate: new Date().toISOString().slice(0, 10),
      customerId: "",
      amount: "",
      fileNo: "",
      bankName: "",
      bankBranch: "",
      comment: "",
    });
    setEditing(null);
  };

  const handleEditClick = (item) => {
    setEditing(item);
    setForm({
      transactionDate: item.transactionDate,
      expiredDate: item.expiredDate,
      customerId: item.customer?.id || "",
      amount: item.amount,
      fileNo: item.fileNo,
      bankName: item.bankName,
      bankBranch: item.bankBranch,
      comment: item.comment,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      await deleteCheque(id);
      getPayrollByYear(year);
    }
  };

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
              onChange={(e) => setType(e.target.value)}
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

        {/* Form Kartı */}
        <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] backdrop-blur-sm shadow-2xl">
          <h3
            className={`text-xl font-bold mb-8 flex items-center gap-3 ${currentTheme.color}`}
          >
            <span className={`w-2 h-7 rounded-full ${currentTheme.bg}`}></span>
            {editing ? "Kayıt Düzenle" : `Yeni ${currentTheme.label} Kaydı`}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  İşlem Tarihi
                </label>
                <input
                  type="date"
                  value={form.transactionDate}
                  required
                  onChange={(e) =>
                    setForm({ ...form, transactionDate: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Vade Tarihi
                </label>
                <input
                  type="date"
                  value={form.expiredDate}
                  required
                  onChange={(e) =>
                    setForm({ ...form, expiredDate: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Müşteri / Firma
                </label>
                <select
                  required
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                >
                  <option value="">Seçiniz...</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Evrak Seri/No
                </label>
                <input
                  type="text"
                  placeholder="Örn: ABC-123"
                  value={form.fileNo}
                  onChange={(e) => setForm({ ...form, fileNo: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Banka Adı
                </label>
                <input
                  type="text"
                  placeholder="Banka ismi..."
                  value={form.bankName}
                  onChange={(e) =>
                    setForm({ ...form, bankName: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Şube Bilgisi
                </label>
                <input
                  type="text"
                  placeholder="Şube..."
                  value={form.bankBranch}
                  onChange={(e) =>
                    setForm({ ...form, bankBranch: e.target.value })
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Tutar (₺)
                </label>
                <input
                  required
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono font-bold transition"
                />
              </div>
              <div className="flex gap-3 items-end">
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl ${currentTheme.bg} hover:brightness-110`}
                >
                  {editing ? "Kaydı Güncelle" : "Hızlı Ekle"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition"
                  >
                    İptal
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Tablo Listesi */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="p-7 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span
                className={`p-2 rounded-xl ${currentTheme.bg} bg-opacity-20 ${currentTheme.color}`}
              >
                {currentTheme.icon}
              </span>
              {currentTheme.label} Geçmişi
            </h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </span>
              <input
                type="text"
                placeholder="Müşteri, banka veya no ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-2xl pl-11 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-full sm:w-80 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">
                  <th className="p-6">İşlem Tarihi</th>
                  <th className="p-6">Vade Tarihi</th>
                  <th className="p-6">Müşteri / Cari</th>
                  <th className="p-6">Evrak Detayı</th>
                  <th className="p-6 text-right">Tutar</th>
                  <th className="p-6 text-center w-32">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-500/5 transition-all group"
                  >
                    <td className="p-6 text-gray-400 font-mono text-sm">
                      {item.transactionDate}
                    </td>
                    <td className="p-6">
                      <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-bold font-mono">
                        {item.expiredDate}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-white text-base">
                        {item.customer?.name}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">
                        Cari ID: #{item.customer?.id}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-white text-sm font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                        {item.bankName || "Banka Yok"}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 ml-3.5 italic">
                        {item.bankBranch || "Şube Belirtilmemiş"} —{" "}
                        <span className="text-gray-400 font-mono">
                          {item.fileNo}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <p className="text-white font-black font-mono text-lg">
                        ₺{" "}
                        {Number(item.amount).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2.5 bg-gray-800 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all shadow-lg border border-gray-700"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-red-500 rounded-xl transition-all shadow-lg border border-gray-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredList.length === 0 && (
              <div className="py-20 text-center text-gray-600 italic">
                Bu kriterlere uygun kayıt bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
