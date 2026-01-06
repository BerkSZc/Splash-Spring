import CustomerSearchSelect from "../../../components/CustomerSearchSelect.jsx";

export default function FinancialForm({
  type,
  addForm,
  setAddForm,
  handleAdd,
  customers,
}) {
  return (
    <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem]">
      <h3
        className={`text-xl font-bold mb-6 flex items-center gap-3 ${
          type === "received" ? "text-emerald-400" : "text-blue-400"
        }`}
      >
        <span
          className={`w-2 h-7 rounded-full ${
            type === "received" ? "bg-emerald-500" : "bg-blue-500"
          }`}
        ></span>
        {type === "received" ? "Yeni Tahsilat Girişi" : "Yeni Ödeme Girişi"}
      </h3>
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Tarih
          </label>
          <input
            type="date"
            value={addForm.date}
            required
            onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Müşteri / Firma
          </label>
          <CustomerSearchSelect
            customers={customers}
            value={addForm.customerId}
            onChange={(id) => setAddForm({ ...addForm, customerId: id })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Tutar (₺)
          </label>
          <input
            required
            type="number"
            placeholder="0.00"
            value={addForm.price}
            onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Açıklama
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Not ekleyin..."
              value={addForm.comment}
              onChange={(e) =>
                setAddForm({ ...addForm, comment: e.target.value })
              }
              className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition"
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
                type === "received"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              Ekle
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
