import MaterialSearchSelect from "../../../components/MaterialSearchSelect";
import MaterialPriceTooltip from "../../../components/MaterialPriceTooltip";

export default function InvoiceEditModal({
  editingInvoice,
  form,
  setForm,
  totals,
  invoiceType,
  materials,
  customers,
  onCancel,
  onSave,
}) {
  if (!editingInvoice || !form) return null;

  const handleItemChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...form.items];
    updated[i] = { ...updated[i], [name]: value };
    const qty = Number(updated[i].quantity) || 0;
    const price = Number(updated[i].unitPrice) || 0;
    const kdv = Number(updated[i].kdv) || 0;
    updated[i].lineTotal =
      invoiceType === "purchase" ? price * qty * (1 + kdv / 100) : price * qty;
    setForm({ ...form, items: updated });
  };

  const handlePriceSelect = (index, price, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updated = [...form.items];
    updated[index].unitPrice = price;
    const qty = Number(updated[index].quantity) || 0;
    const kdv = Number(updated[index].kdv) || 0;
    updated[index].lineTotal =
      invoiceType === "purchase" ? price * qty * (1 + kdv / 100) : price * qty;
    setForm({ ...form, items: updated });
  };

  const addItem = () =>
    setForm({
      ...form,
      items: [
        ...form.items,
        { materialId: "", unitPrice: "", quantity: "", kdv: 20, lineTotal: 0 },
      ],
    });
  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[3rem] w-full max-w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3">
          <span className="p-2 bg-blue-600 rounded-xl text-xl">📝</span>Faturayı
          Güncelle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Tarih
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Belge No
            </label>
            <input
              type="text"
              value={form.fileNo}
              onChange={(e) => setForm({ ...form, fileNo: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Müşteri / Firma
            </label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white cursor-pointer"
            >
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 overflow-hidden mb-8">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-4 py-2">Malzeme</th>
                <th className="p-5 text-center">Birim Fiyat</th>
                <th className="p-5">Miktar</th>
                <th className="p-5">KDV %</th>
                <th className="px-4 py-2 text-right">KDV Tutarı</th>
                <th className="px-4 py-2 text-right">Satır Toplamı</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, i) => (
                <tr key={i} className="bg-gray-800/50">
                  <td className="px-4 py-3 rounded-l-xl w-1/3">
                    <MaterialSearchSelect
                      materials={materials}
                      value={item.materialId}
                      onChange={(id) => {
                        const updated = [...form.items];
                        updated[i].materialId = id;
                        setForm({ ...form, items: updated });
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(i, e)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-1 py-2 text-white focus:border-blue-500 outline-none"
                      />
                      <MaterialPriceTooltip
                        materialId={item.materialId}
                        onSelect={(p, e) => handlePriceSelect(i, p, e)}
                        disabled={!item.materialId}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      name="kdv"
                      value={item.kdv}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-gray-400 italic">
                    {(
                      (Number(item.unitPrice) *
                        Number(item.quantity) *
                        Number(item.kdv)) /
                      100
                    ).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                    {(
                      Number(item.unitPrice) * Number(item.quantity) || 0
                    ).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </td>
                  <td className="px-4 py-3 rounded-r-xl text-center">
                    {form.items.length > 1 && (
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addItem}
            className="mt-4 text-blue-400 font-bold px-4 py-2 hover:text-blue-300"
          >
            + Yeni Kalem Ekle
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gray-900/60 p-8 rounded-[2.5rem] border border-gray-800 mb-8">
          <div className="text-gray-500 text-sm italic">
            * Rakamlar otomatik olarak hesaplanmaktadır.
          </div>
          <div className="text-right min-w-[280px] space-y-3">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Ara Toplam:</span>
              <span className="font-mono text-white">
                {totals.totalPrice.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-blue-400 text-sm font-semibold">
              <span>Hesaplanan KDV:</span>
              <span className="font-mono">
                +
                {totals.kdvToplam.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-3 border-t border-gray-700 mt-2">
              <span className="text-white">Genel Toplam:</span>
              <span className="text-emerald-400">
                {(totals.totalPrice + totals.kdvToplam).toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 }
                )}{" "}
                ₺
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 font-bold">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl hover:bg-gray-700 transition"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl transition shadow-blue-600/20"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
