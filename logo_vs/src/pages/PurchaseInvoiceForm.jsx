import { useEffect, useState } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice.js";
import { useMaterial } from "../../backend/store/useMaterial.js";
import { useClient } from "../../backend/store/useClient.js";

export default function PurchaseInvoiceForm() {
  const { addPurchaseInvoice } = usePurchaseInvoice();
  const { getMaterials, materials } = useMaterial();
  const { getAllClient, clients } = useClient();

  const [form, setForm] = useState({
    date: "",
    fileNo: "",
    customerId: "",
    items: [{ materialId: "", unitPrice: "", quantity: "", lineTotal: 0 }],
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // 🔹 Malzeme + müşteri verilerini yükle
  useEffect(() => {
    getMaterials();
    getAllClient();
  }, [getMaterials, getAllClient]);

  // 🧮 Line total ve genel toplam hesapla
  useEffect(() => {
    // Her kalem için satır toplamını hesapla
    const updatedItems = form.items.map((i) => ({
      ...i,
      lineTotal:
        i.unitPrice && i.quantity
          ? Number(i.unitPrice) * Number(i.quantity)
          : 0,
    }));

    // Genel toplamı hesapla
    const total = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);

    // 🔹 Yalnızca lineTotal değişmişse state'i güncelle
    const itemsChanged =
      JSON.stringify(form.items) !== JSON.stringify(updatedItems);

    if (itemsChanged) {
      setForm((prev) => ({ ...prev, items: updatedItems }));
    }

    setTotalPrice(total);
    // ❗️ Sadece form.items'a bağımlı olacak
  }, [form.items]);

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { materialId: "", unitPrice: "", quantity: "", lineTotal: 0 },
      ],
    });
  };

  const handleChangeItem = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...form.items];
    updatedItems[index][name] = value;
    setForm({ ...form, items: updatedItems });
  };

  const handleSelectMaterial = (index, id) => {
    const updatedItems = [...form.items];
    updatedItems[index].materialId = id;
    setForm({ ...form, items: updatedItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invoiceData = {
      date: form.date,
      fileNo: form.fileNo,
      items: form.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
      })),
    };

    addPurchaseInvoice(form.customerId, invoiceData);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Satın Alma Faturası Oluştur
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🧾 Temel bilgiler */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Tarih
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border rounded-lg w-full p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Belge No
            </label>
            <input
              type="text"
              name="fileNo"
              value={form.fileNo}
              onChange={handleChange}
              className="border rounded-lg w-full p-2"
              required
            />
          </div>

          {/* 🧍 Müşteri Seçimi */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Müşteri
            </label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              className="border rounded-lg w-full p-2"
              required
            >
              <option value="">Seçiniz</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} – {c.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🧮 Kalem tablosu */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Kalemler</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Malzeme</th>
                  <th className="p-2 text-left">Birim Fiyat</th>
                  <th className="p-2 text-left">Miktar</th>
                  <th className="p-2 text-left">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {form.items?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <select
                        name="materialId"
                        value={item.materialId}
                        onChange={(e) =>
                          handleSelectMaterial(index, e.target.value)
                        }
                        className="border rounded-lg p-1 w-full"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code} - {m.comment} ({m.unit})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleChangeItem(index, e)}
                        className="border rounded-lg p-1 w-full"
                        required
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(index, e)}
                        className="border rounded-lg p-1 w-full"
                        required
                      />
                    </td>

                    <td className="p-2 text-right text-gray-700 font-medium">
                      {item.lineTotal.toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Kalem Ekle
          </button>
        </div>

        {/* 🧾 Genel toplam */}
        <div className="flex justify-end mt-6">
          <div className="text-right">
            <p className="text-gray-600 text-sm">Toplam Tutar:</p>
            <p className="text-2xl font-semibold text-blue-700">
              {totalPrice.toFixed(2)} ₺
            </p>
          </div>
        </div>

        {/* 🧩 Kaydet */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fatura Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
