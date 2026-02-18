import MaterialSearchSelect from "../../../components/MaterialSearchSelect";
import MaterialPriceTooltip from "../../../components/MaterialPriceTooltip";
import CustomerSearchSelect from "../../../components/CustomerSearchSelect";

export default function InvoiceEditModal({
  form,
  setForm,
  onItemChange,
  onRateChange,
  modalTotals,
  addItem,
  removeItem,
  handlePriceSelect,
  materials,
  customers,
  onCancel,
  onSave,
  formatNumber,
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
      <div className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[1300px] min-h-[80vh] max-h-[95vh] overflow-y-auto shadow-2xl relative">
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
              value={form?.date || ""}
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
              value={form?.fileNo || ""}
              onChange={(e) => setForm({ ...form, fileNo: e.target.value })}
              className="w-full uppercase bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Müşteri / Firma
            </label>
            <CustomerSearchSelect
              customers={customers}
              value={form?.customerId || ""}
              onChange={(id) => setForm({ ...form, customerId: id })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 bg-gray-800/30 rounded-3xl border border-gray-700/50">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase ml-1 tracking-widest">
                USD Satış Kuru
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  value={form?.usdSellingRate || ""}
                  onChange={(e) =>
                    onRateChange("usdSellingRate", e.target.value)
                  }
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-8 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-pink-400 uppercase ml-1 tracking-widest">
                EUR Satış Kuru
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
                <input
                  type="text"
                  value={form?.eurSellingRate || ""}
                  onChange={(e) =>
                    onRateChange("eurSellingRate", e.target.value)
                  }
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-2xl px-8 py-3 text-white outline-none focus:border-pink-500 transition-all font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 overflow-hidden mb-8">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-4 py-2 w-[30%]">Malzeme</th>
                <th className="px-4 py-2 w-[13%]">Miktar</th>
                <th className="px-4 py-2 w-[15%] text-center">Birim Fiyat</th>
                <th className="px-4 py-2 w-[10%] text-center">KDV %</th>
                <th className="px-4 py-2 text-right">KDV Tutarı</th>
                <th className="px-4 py-2 text-right">Satır Toplamı</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(form.items) ? form.items : []).map((item, i) => (
                <tr key={i} className="bg-gray-800/50">
                  <td className="px-4 py-3 rounded-l-xl w-45">
                    <MaterialSearchSelect
                      materials={materials}
                      value={item?.materialId || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      onChange={(id) => {
                        onItemChange(i, "materialId", id);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      name="quantity"
                      value={formatNumber(item?.quantity) || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "");
                        onItemChange(i, "quantity", val);
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <input
                        type="text"
                        name="unitPrice"
                        value={formatNumber(item?.unitPrice) || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.,]/g, "");

                          onItemChange(i, "unitPrice", val);
                        }}
                        className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-1 py-2 text-white focus:border-blue-500 outline-none"
                      />
                      <MaterialPriceTooltip
                        materialId={item.materialId}
                        customerId={form.customerId}
                        onSelect={(p, e) => handlePriceSelect(i, p, e)}
                        disabled={!item.materialId}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      name="kdv"
                      value={item?.kdv || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem();
                        }
                      }}
                      onChange={(e) => onItemChange(i, e)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-gray-400 italic">
                    {Number(item?.kdvTutar || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-400 w-48">
                    <div className="relative group">
                      <input
                        type="text"
                        step="0.01"
                        value={formatNumber(item?.lineTotal) || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.,]/g, "");
                          onItemChange(i, "lineTotal", val);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full  bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-right font-mono font-bold text-blue-400 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none group-focus-within:hidden">
                        ₺
                      </span>
                    </div>
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
                {(Number(modalTotals?.subTotal) || 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-blue-400 text-sm font-semibold">
              <span>Hesaplanan KDV:</span>
              <span className="font-mono">
                +
                {(Number(modalTotals.kdvTotal) || 0).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </span>
            </div>
            <div className="flex justify-between text-2xl font-black pt-3 border-t border-gray-700 mt-2">
              <span className="text-white">Genel Toplam:</span>
              <span className="text-emerald-400">
                {(Number(modalTotals.generalTotal) || 0).toLocaleString(
                  "tr-TR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
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
            type="button"
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
