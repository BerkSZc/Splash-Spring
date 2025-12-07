import { useEffect, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";
import { useClient } from "../../backend/store/useClient.js";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice.js";
import MaterialPriceTooltip from "../components/MaterialPriceTooltip.jsx";

export default function SalesInvoiceForm() {
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { addSalesInvoice } = useSalesInvoice();

  const [form, setForm] = useState({
    date: "",
    fileNo: "",
    customerId: "",
    items: [
      { materialId: "", unitPrice: "", quantity: "", kdv: 20, lineTotal: 0 },
    ],
  });

  const [totals, setTotals] = useState({
    kdvToplam: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    getMaterials();
    getAllCustomers();
  }, []);

  // 🔹 Hesaplamalar
  useEffect(() => {
    let changed = false;

    const updatedItems = form.items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const kdv = Number(item.kdv) || 0;

      const line = qty * price;

      if (line !== item.lineTotal) changed = true;

      return { ...item, lineTotal: line };
    });

    if (changed) {
      setForm((prev) => ({ ...prev, items: updatedItems }));
    }

    const total = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const kdvTotal = updatedItems.reduce(
      (sum, i) => sum + (i.lineTotal * i.kdv) / 100,
      0
    );

    setTotals({ totalPrice: total, kdvToplam: kdvTotal });
  }, [form.items]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const updated = [...form.items];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { materialId: "", unitPrice: "", quantity: "", kdv: 20, lineTotal: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      date: form.date,
      fileNo: form.fileNo,
      customer: { id: Number(form.customerId) },
      items: form.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };

    addSalesInvoice(Number(form.customerId), payload);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Satış Faturası Oluştur
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Üst Bilgiler */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-600">Tarih</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="mt-1 w-full border p-2 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Belge No</label>
            <input
              type="text"
              name="fileNo"
              value={form.fileNo}
              onChange={handleChange}
              className="mt-1 w-full border p-2 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Müşteri</label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className="mt-1 w-full border p-2 rounded-lg"
              required
            >
              <option value="">Seçiniz</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} – {c.balance}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kalem Tablosu */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Kalemler</h2>

          <table className="w-full text-sm border rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Malzeme</th>
                <th className="p-3 text-left">Birim Fiyat</th>
                <th className="p-3 text-left">Miktar</th>
                <th className="p-3 text-left">KDV %</th>
                <th className="p-3 text-right">Toplam</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {form.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <select
                      name="materialId"
                      value={item.materialId}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full border p-2 rounded-lg"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} – {m.comment}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 flex items-center gap-1">
                    <input
                      type="number"
                      name="unitPrice"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full border p-2 rounded-lg"
                    />
                    <MaterialPriceTooltip
                      materialId={item.materialId}
                      onSelect={(price) =>
                        handleItemChange(i, {
                          target: { name: "unitPrice", value: price },
                        })
                      }
                      disabled={!item.materialId}
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      name="kdv"
                      value={item.kdv}
                      onChange={(e) => handleItemChange(i, e)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </td>

                  <td className="p-3 text-right font-semibold text-gray-700">
                    {item.lineTotal.toFixed(2)} ₺
                  </td>

                  <td className="p-3 text-right">
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="px-3 py-1 text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Yeni Kalem
          </button>
        </div>

        {/* Toplam */}
        <div className="flex justify-end text-right mt-5">
          <div>
            <p className="text-sm text-gray-600">KDV Toplam</p>
            <p className="text-xl font-semibold text-blue-600">
              {totals.kdvToplam.toFixed(2)} ₺
            </p>

            <p className="text-sm text-gray-600 mt-2">Genel Toplam</p>
            <p className="text-2xl font-bold text-green-600">
              {(totals.totalPrice + totals.kdvToplam).toFixed(2)} ₺
            </p>
          </div>
        </div>

        {/* Kaydet */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg transition"
          >
            Faturayı Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
