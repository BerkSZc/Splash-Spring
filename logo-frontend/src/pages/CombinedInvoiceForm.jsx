import { useEffect, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";
import { useClient } from "../../backend/store/useClient.js";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice.js";
import MaterialPriceTooltip from "../components/MaterialPriceTooltip.jsx";
import MaterialSearchSelect from "../MaterialSearchSelect.jsx";

export default function CombinedInvoiceForm() {
  const [mode, setMode] = useState("sales"); // "sales" | "purchase"

  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { addSalesInvoice } = useSalesInvoice();
  const { addPurchaseInvoice } = usePurchaseInvoice();

  // --- Formlar ---
  const [salesForm, setSalesForm] = useState({
    date: "",
    fileNo: "",
    customerId: "",
    items: [
      { materialId: "", unitPrice: "", quantity: "", kdv: 20, lineTotal: 0 },
    ],
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: "",
    fileNo: "",
    id: "",
    items: [
      { materialId: "", unitPrice: "", quantity: "", kdv: 20, lineTotal: 0 },
    ],
  });

  const [salesTotals, setSalesTotals] = useState({
    kdvToplam: 0,
    totalPrice: 0,
  });

  const [purchaseTotal, setPurchaseTotal] = useState(0);

  useEffect(() => {
    getMaterials();
    getAllCustomers();
  }, []);

  // --- SATIŞ FATURASI HESAPLAMA ---
  useEffect(() => {
    let changed = false;

    const updatedItems = salesForm.items.map((item) => {
      const line = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      if (line !== item.lineTotal) changed = true;
      return { ...item, lineTotal: line };
    });

    if (changed) {
      setSalesForm((prev) => ({ ...prev, items: updatedItems }));
    }

    const total = updatedItems.reduce((s, i) => s + i.lineTotal, 0);
    const kdv = updatedItems.reduce(
      (s, i) => s + (i.lineTotal * i.kdv) / 100,
      0
    );

    setSalesTotals({
      totalPrice: total,
      kdvToplam: kdv,
    });
  }, [salesForm.items]);

  // --- SATIN ALMA FATURASI HESAPLAMA ---
  useEffect(() => {
    const updated = purchaseForm.items.map((i) => ({
      ...i,
      lineTotal:
        i.unitPrice && i.quantity
          ? Number(i.unitPrice) * Number(i.quantity) * (1 + (i.kdv || 0) / 100)
          : 0,
    }));

    const changed =
      JSON.stringify(updated) !== JSON.stringify(purchaseForm.items);

    if (changed) {
      setPurchaseForm((prev) => ({ ...prev, items: updated }));
    }

    const total = updated.reduce((s, i) => s + i.lineTotal, 0);
    setPurchaseTotal(total);
  }, [purchaseForm.items]);

  // --- FORM GÖNDERME ---
  const submitSales = (e) => {
    e.preventDefault();
    const payload = {
      date: salesForm.date,
      fileNo: salesForm.fileNo,
      customer: { id: Number(salesForm.customerId) },
      items: salesForm.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };
    addSalesInvoice(Number(salesForm.customerId), payload);
  };

  const submitPurchase = (e) => {
    e.preventDefault();
    const payload = {
      date: purchaseForm.date,
      fileNo: purchaseForm.fileNo,
      items: purchaseForm.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };
    addPurchaseInvoice(purchaseForm.id, payload);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8">
      {/* SAĞ ÜST SEÇİM */}
      <div className="flex justify-end mb-6">
        <select
          className="border p-2 rounded-lg shadow"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="sales">Satış Faturası</option>
          <option value="purchase">Satın Alma Faturası</option>
        </select>
      </div>

      {/* -------------------------------------- */}
      {/* ----------- SATIŞ FATURASI ----------- */}
      {/* -------------------------------------- */}
      {mode === "sales" && (
        <form onSubmit={submitSales} className="space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Satış Faturası Oluştur
          </h1>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-600">Tarih</label>
              <input
                type="date"
                name="date"
                value={salesForm.date}
                onChange={(e) =>
                  setSalesForm({ ...salesForm, date: e.target.value })
                }
                className="mt-1 w-full border p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Belge No</label>
              <input
                type="text"
                name="fileNo"
                value={salesForm.fileNo}
                onChange={(e) =>
                  setSalesForm({ ...salesForm, fileNo: e.target.value })
                }
                className="mt-1 w-full border p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Müşteri</label>
              <select
                name="customerId"
                value={salesForm.customerId}
                onChange={(e) =>
                  setSalesForm({ ...salesForm, customerId: e.target.value })
                }
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

          {/* KALEM TABLOSU */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Kalemler
            </h2>

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
                {salesForm.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">
                      <MaterialSearchSelect
                        materials={materials}
                        value={item.materialId}
                        onChange={(id) => {
                          const updated = [...salesForm.items];
                          updated[i].materialId = id;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                      />
                    </td>

                    <td className="p-2 flex items-center gap-1">
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...salesForm.items];
                          updated[i].unitPrice = e.target.value;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                        className="w-full border p-2 rounded-lg"
                      />
                      <MaterialPriceTooltip
                        materialId={item.materialId}
                        onSelect={(price) => {
                          const updated = [...salesForm.items];
                          updated[i].unitPrice = price;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                        disabled={!item.materialId}
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...salesForm.items];
                          updated[i].quantity = e.target.value;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                        className="w-full border p-2 rounded-lg"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        name="kdv"
                        value={item.kdv}
                        onChange={(e) => {
                          const updated = [...salesForm.items];
                          updated[i].kdv = e.target.value;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                        className="w-full border p-2 rounded-lg"
                      />
                    </td>

                    <td className="p-3 text-right font-semibold text-gray-700">
                      {item.lineTotal.toFixed(2)} ₺
                    </td>

                    <td className="p-3 text-right">
                      {salesForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSalesForm({
                              ...salesForm,
                              items: salesForm.items.filter(
                                (_, idx) => idx !== i
                              ),
                            });
                          }}
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
              onClick={() =>
                setSalesForm({
                  ...salesForm,
                  items: [
                    ...salesForm.items,
                    {
                      materialId: "",
                      unitPrice: "",
                      quantity: "",
                      kdv: 20,
                      lineTotal: 0,
                    },
                  ],
                })
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Yeni Kalem
            </button>
          </div>

          {/* TOPLAM */}
          <div className="flex justify-end text-right mt-5">
            <div>
              <p className="text-sm text-gray-600">KDV Toplam</p>
              <p className="text-xl font-semibold text-blue-600">
                {salesTotals.kdvToplam.toFixed(2)} ₺
              </p>

              <p className="text-sm text-gray-600 mt-2">Genel Toplam</p>
              <p className="text-2xl font-bold text-green-600">
                {(salesTotals.totalPrice + salesTotals.kdvToplam).toFixed(2)} ₺
              </p>
            </div>
          </div>

          {/* KAYDET */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg transition"
            >
              Faturayı Kaydet
            </button>
          </div>
        </form>
      )}

      {/* -------------------------------------- */}
      {/* -------- SATIN ALMA FATURASI --------- */}
      {/* -------------------------------------- */}
      {mode === "purchase" && (
        <form onSubmit={submitPurchase} className="space-y-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">
            Satın Alma Faturası Oluştur
          </h1>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-600">Tarih</label>
              <input
                type="date"
                name="date"
                value={purchaseForm.date}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, date: e.target.value })
                }
                className="mt-1 w-full border p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Belge No</label>
              <input
                type="text"
                name="fileNo"
                value={purchaseForm.fileNo}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, fileNo: e.target.value })
                }
                className="mt-1 w-full border p-2 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Müşteri</label>
              <select
                name="id"
                value={purchaseForm.id}
                onChange={(e) =>
                  setPurchaseForm({ ...purchaseForm, id: e.target.value })
                }
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

          {/* KALEM TABLOSU */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Kalemler
            </h2>

            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Malzeme</th>
                  <th className="p-3 text-left">Birim Fiyat</th>
                  <th className="p-3 text-left">Miktar</th>
                  <th className="p-3 text-left">KDV %</th>
                  <th className="p-3 text-right">Toplam (KDV Dahil)</th>
                </tr>
              </thead>

              <tbody>
                {purchaseForm.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">
                      <MaterialSearchSelect
                        materials={materials}
                        value={item.materialId}
                        onChange={(id) => {
                          const updated = [...salesForm.items];
                          updated[i].materialId = id;
                          setSalesForm({ ...salesForm, items: updated });
                        }}
                      />
                    </td>

                    <td className="p-2 flex items-center gap-1">
                      <input
                        type="number"
                        name="unitPrice"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...purchaseForm.items];
                          updated[i].unitPrice = e.target.value;
                          setPurchaseForm({
                            ...purchaseForm,
                            items: updated,
                          });
                        }}
                        className="w-full border p-2 rounded-lg"
                      />
                      <MaterialPriceTooltip
                        materialId={item.materialId}
                        onSelect={(price) => {
                          const updated = [...purchaseForm.items];
                          updated[i].unitPrice = price;
                          setPurchaseForm({
                            ...purchaseForm,
                            items: updated,
                          });
                        }}
                        disabled={!item.materialId}
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...purchaseForm.items];
                          updated[i].quantity = e.target.value;
                          setPurchaseForm({
                            ...purchaseForm,
                            items: updated,
                          });
                        }}
                        className="w-full border p-2 rounded-lg"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        name="kdv"
                        value={item.kdv}
                        onChange={(e) =>
                          setPurchaseForm({
                            ...purchaseForm,
                            items: purchaseForm.items.map((itm, idx) =>
                              idx === i ? { ...itm, kdv: e.target.value } : itm
                            ),
                          })
                        }
                        className="w-full border p-2 rounded-lg"
                      />
                    </td>

                    <td className="p-3 text-right font-semibold text-gray-700">
                      {item.lineTotal.toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={() =>
                setPurchaseForm({
                  ...purchaseForm,
                  items: [
                    ...purchaseForm.items,
                    {
                      materialId: "",
                      unitPrice: "",
                      quantity: "",
                      kdv: 20,
                      lineTotal: 0,
                    },
                  ],
                })
              }
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Yeni Kalem
            </button>
          </div>

          {/* TOPLAM */}
          <div className="flex justify-end text-right mt-5">
            <div>
              <p className="text-sm text-gray-600">Genel Toplam (KDV Dahil)</p>
              <p className="text-2xl font-bold text-green-600">
                {purchaseTotal.toFixed(2)} ₺
              </p>
            </div>
          </div>

          {/* KAYDET */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg transition"
            >
              Faturayı Kaydet
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
