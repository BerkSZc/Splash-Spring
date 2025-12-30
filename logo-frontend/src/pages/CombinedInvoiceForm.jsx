import { useEffect, useMemo, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";
import { useClient } from "../../backend/store/useClient.js";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice.js";
import MaterialPriceTooltip from "../components/MaterialPriceTooltip.jsx";
import MaterialSearchSelect from "../components/MaterialSearchSelect.jsx";
import { useYear } from "../context/YearContext.jsx";
import toast from "react-hot-toast";

export default function CombinedInvoiceForm() {
  const [mode, setMode] = useState("sales"); // "sales" | "purchase"

  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { addSalesInvoice, getSalesInvoicesByYear } = useSalesInvoice();
  const { addPurchaseInvoice, getPurchaseInvoiceByYear } = usePurchaseInvoice();

  const { year } = useYear();

  // --- Formlar ---
  const initalItem = {
    materialId: "",
    unitPrice: "",
    quantity: "",
    kdv: 20,
    lineTotal: 0,
  };

  const [salesForm, setSalesForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    fileNo: "",
    customerId: "",
    items: [{ ...initalItem }],
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    fileNo: "",
    customerId: "",
    items: [{ ...initalItem }],
  });

  useEffect(() => {
    getMaterials();
    getAllCustomers();
  }, []);

  const salesCalculation = useMemo(() => {
    const total = salesForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0
    );
    const kdv = salesForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0
    );
    return { total, kdv, grandTotal: total + kdv };
  }, [salesForm.items]);

  // Satın Alma Hesaplamaları
  const purchaseCalculation = useMemo(() => {
    const total = purchaseForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0
    );
    const kdv = purchaseForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0
    );
    return { total, kdv, grandTotal: total + kdv };
  }, [purchaseForm.items]);

  // --- FORM İŞLEMLERİ ---
  const handleItemChange = (formType, index, field, value) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
    setter((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = (formType) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
    setter((prev) => ({ ...prev, items: [...prev.items, { ...initalItem }] }));
  };

  const removeItem = (formType, index) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
    setter((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const isSales = mode === "sales";
    const currentForm = isSales ? salesForm : purchaseForm;

    const validItems = currentForm.items.filter(
      (item) => item.materialId !== ""
    );

    if (validItems.length === 0) {
      toast.error("Faturaya en az bir malzeme seçerek eklemelisiniz!");
      return;
    }

    const payload = {
      date: currentForm.date,
      fileNo: currentForm.fileNo,
      ...(isSales ? { customer: { id: Number(currentForm.customerId) } } : {}),
      items: currentForm.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };

    if (isSales) {
      await addSalesInvoice(Number(currentForm.customerId), payload);
      getSalesInvoicesByYear(year);
    } else {
      await addPurchaseInvoice(Number(currentForm.customerId), payload);
      getPurchaseInvoiceByYear(year);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BAŞLIK VE MOD SEÇİMİ */}
        <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Fatura Oluştur
            </h1>
            <p className="text-gray-400 mt-1">
              {mode === "sales" ? "Müşteriye Satış" : "Firmadan Satın Alma"}
            </p>
          </div>
          <select
            className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none font-bold"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="sales">Satış Faturası</option>
            <option value="purchase">Satın Alma Faturası</option>
          </select>
        </div>

        {/* ANA FORM */}
        <form onSubmit={submitForm} className="space-y-8">
          {/* ÜST BİLGİLER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Tarih
              </label>
              <input
                type="date"
                required
                value={mode === "sales" ? salesForm.date : purchaseForm.date}
                onChange={(e) =>
                  mode === "sales"
                    ? setSalesForm({ ...salesForm, date: e.target.value })
                    : setPurchaseForm({ ...purchaseForm, date: e.target.value })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Belge No
              </label>
              <input
                type="text"
                required
                placeholder="Örn: FAT2025001"
                value={
                  mode === "sales" ? salesForm.fileNo : purchaseForm.fileNo
                }
                onChange={(e) =>
                  mode === "sales"
                    ? setSalesForm({ ...salesForm, fileNo: e.target.value })
                    : setPurchaseForm({
                        ...purchaseForm,
                        fileNo: e.target.value,
                      })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Müşteri / Firma
              </label>
              <select
                required
                value={
                  mode === "sales"
                    ? salesForm.customerId
                    : purchaseForm.customerId
                }
                onChange={(e) =>
                  mode === "sales"
                    ? setSalesForm({ ...salesForm, customerId: e.target.value })
                    : setPurchaseForm({
                        ...purchaseForm,
                        customerId: e.target.value,
                      })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">Seçiniz...</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - (Bakiye: {c.balance}₺)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KALEMLER TABLOSU */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Fatura Kalemleri
              </h3>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-widest">
                    <th className="px-4 py-2">Malzeme</th>
                    <th className="px-4 py-2">Birim Fiyat</th>
                    <th className="px-4 py-2">Miktar</th>
                    <th className="px-4 py-2">KDV %</th>
                    <th className="px-4 py-2 text-right">Satır Toplamı</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {(mode === "sales"
                    ? salesForm.items
                    : purchaseForm.items
                  ).map((item, i) => (
                    <tr key={i} className="bg-gray-800/50 group">
                      <td className="px-4 py-3 rounded-l-xl w-1/3">
                        <MaterialSearchSelect
                          materials={materials}
                          value={item.materialId}
                          onChange={(id) =>
                            handleItemChange(mode, i, "materialId", id)
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                mode,
                                i,
                                "unitPrice",
                                e.target.value
                              )
                            }
                          />
                          <MaterialPriceTooltip
                            materialId={item.materialId}
                            onSelect={(p, e) => {
                              if (e) e.stopPropagation();
                              handleItemChange(mode, i, "unitPrice", p);
                            }}
                            disabled={!item?.materialId}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              mode,
                              i,
                              "quantity",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.kdv}
                          onChange={(e) =>
                            handleItemChange(mode, i, "kdv", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                        {(
                          Number(item.unitPrice) * Number(item.quantity) || 0
                        ).toLocaleString()}{" "}
                        ₺
                      </td>
                      <td className="px-4 py-3 rounded-r-xl">
                        <button
                          type="button"
                          onClick={() => removeItem(mode, i)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => addItem(mode)}
                className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold px-4 py-2 rounded-lg transition-all"
              >
                <span className="text-xl">+</span> Yeni Kalem Ekle
              </button>
            </div>
          </div>

          {/* ALT TOPLAMLAR VE KAYDET */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800">
            <div className="space-y-2 text-gray-400 text-sm italic">
              * Kalemlerin toplamı otomatik olarak hesaplanmaktadır.
            </div>

            <div className="space-y-4 text-right min-w-[250px]">
              {mode === "sales" ? (
                <>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Ara Toplam:</span>
                    <span className="font-mono text-white">
                      {salesCalculation.total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>KDV Toplam:</span>
                    <span className="font-mono text-blue-400">
                      {salesCalculation.kdv.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold border-t border-gray-800 pt-2">
                    <span className="text-white">Genel Toplam:</span>
                    <span className="text-emerald-400">
                      {salesCalculation.grandTotal.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Ara Toplam:</span>
                    <span className="font-mono text-white">
                      {purchaseCalculation.total.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>KDV Toplam:</span>
                    <span className="font-mono text-blue-400">
                      {purchaseCalculation.kdv.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold border-t border-gray-800 pt-2">
                    <span className="text-white">
                      Genel Toplam (KDV Dahil):
                    </span>
                    <span className="text-emerald-400">
                      {purchaseCalculation.grandTotal.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ₺
                    </span>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                Faturayı Kaydet ve Sisteme İşle
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
