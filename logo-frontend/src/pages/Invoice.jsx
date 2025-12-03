import { useEffect, useState } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice";
import { useMaterial } from "../../backend/store/useMaterial";
import { useClient } from "../../backend/store/useClient";

export default function InvoicePage() {
  const { getAllPurchaseInvoices, purchase, editPurchaseInvoice } =
    usePurchaseInvoice();
  const { getAllSalesInvoices, sales, editSalesInvoice } = useSalesInvoice();
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();

  const [invoiceType, setInvoiceType] = useState("purchase");
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    getMaterials();
    getAllCustomers();
    getAllPurchaseInvoices();
    getAllSalesInvoices();
  }, []);

  const invoicesToDisplay = invoiceType === "purchase" ? purchase : sales;

  const [form, setForm] = useState(null);
  const [totals, setTotals] = useState({ kdvToplam: 0, totalPrice: 0 });

  const prepareEditForm = (invoice) => {
    setForm({
      date: invoice.date,
      fileNo: invoice.fileNo,
      customerId: invoice.customer.id,
      items: invoice.items.map((i) => ({
        materialId: i.material.id,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        kdv: i.kdv,
        lineTotal: i.unitPrice * i.quantity,
      })),
    });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    prepareEditForm(invoice);
  };

  // -----------------------------------
  //   YENİ: lineTotal burada hesaplanır
  // -----------------------------------
  const handleItemChange = (i, e) => {
    const updated = [...form.items];

    updated[i] = {
      ...updated[i],
      [e.target.name]: e.target.value,
    };

    // lineTotal yeniden hesaplanıyor
    const qty = Number(updated[i].quantity) || 0;
    const price = Number(updated[i].unitPrice) || 0;
    updated[i].lineTotal = qty * price;

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

  // -----------------------------------
  //   ARTIK BURADA setForm YOK → döngü yok
  // -----------------------------------
  useEffect(() => {
    if (!form) return;

    const total = form.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const kdvTotal = form.items.reduce(
      (sum, i) => sum + (i.lineTotal * i.kdv) / 100,
      0
    );

    setTotals({ totalPrice: total, kdvToplam: kdvTotal });
  }, [form?.items]);

  const handleSave = async () => {
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

    if (invoiceType === "purchase") {
      await editPurchaseInvoice(editingInvoice.id, payload);
      getAllPurchaseInvoices();
    } else {
      await editSalesInvoice(editingInvoice.id, payload);
      getAllSalesInvoices();
    }

    setEditingInvoice(null);
    setForm(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Faturalar</h2>

        <select
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="purchase">Satın Alma Faturası</option>
          <option value="sales">Satış Faturası</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">No</th>
              <th className="p-2">Tarih</th>
              <th className="p-2">Müşteri</th>
              <th className="p-2">Toplam</th>
              <th className="p-2">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {invoicesToDisplay?.length ? (
              invoicesToDisplay.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{inv.fileNo}</td>
                  <td className="p-2">{inv.date}</td>
                  <td className="p-2">{inv.customer?.name}</td>
                  <td className="p-2">{inv.totalPrice?.toFixed(2)} ₺</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEdit(inv)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================== */}
      {/*        EDIT MODAL           */}
      {/* =========================== */}
      {editingInvoice && form && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[900px] max-h-[90vh] overflow-auto shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Fatura Düzenle</h2>

            {/* ÜST BİLGİLER */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label>Tarih</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label>Belge No</label>
                <input
                  type="text"
                  value={form.fileNo}
                  onChange={(e) => setForm({ ...form, fileNo: e.target.value })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label>Müşteri</label>
                <select
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                >
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KALEMLER */}
            <table className="w-full text-sm border rounded-xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Malzeme</th>
                  <th className="p-2">Birim Fiyat</th>
                  <th className="p-2">Miktar</th>
                  <th className="p-2">KDV</th>
                  <th className="p-2">Toplam</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      <select
                        name="materialId"
                        value={item.materialId}
                        onChange={(e) => handleItemChange(i, e)}
                        className="w-full border p-2 rounded"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code} - {m.comment}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(i, e)}
                        className="w-full border p-2 rounded"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(i, e)}
                        className="w-full border p-2 rounded"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        name="kdv"
                        value={item.kdv}
                        onChange={(e) => handleItemChange(i, e)}
                        className="w-full border p-2 rounded"
                      />
                    </td>

                    <td className="p-2">{item.lineTotal.toFixed(2)} ₺</td>

                    <td className="p-2">
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          className="text-red-600"
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
              onClick={addItem}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Kalem Ekle
            </button>

            {/* TOPLAM */}
            <div className="text-right mt-6">
              <p className="text-sm">
                KDV Toplam: {totals.kdvToplam.toFixed(2)} ₺
              </p>
              <p className="text-xl font-bold">
                Genel Toplam:{" "}
                {(totals.totalPrice + totals.kdvToplam).toFixed(2)} ₺
              </p>
            </div>

            {/* BUTONLAR */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setForm(null);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                İptal
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
