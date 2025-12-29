import { useEffect, useState } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice";
import { useMaterial } from "../../backend/store/useMaterial";
import { useClient } from "../../backend/store/useClient";
import { useYear } from "../context/YearContext";
import { useTenant } from "../context/TenantContext";
import MaterialSearchSelect from "../components/MaterialSearchSelect";
import MaterialPriceTooltip from "../components/MaterialPriceTooltip";
import { generateInvoiceHTML } from "../utils/printHelpers.js";

export default function InvoicePage() {
  const {
    purchase,
    editPurchaseInvoice,
    deletePurchaseInvoice,
    getPurchaseInvoiceByYear,
  } = usePurchaseInvoice();
  const {
    sales,
    editSalesInvoice,
    deleteSalesInvoice,
    getSalesInvoicesByYear,
  } = useSalesInvoice();
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();

  const [invoiceType, setInvoiceType] = useState("purchase");
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const { tenant } = useTenant();

  const [openMenuId, setOpenMenuId] = useState(null);

  const [printItem, setPrintItem] = useState(null);

  const executePrint = (dataToPrint) => {
    // Eğer fonksiyon parametresiz çağrıldıysa state'deki printItem'ı kullan
    const inv = dataToPrint || printItem;

    if (!inv) {
      console.error("Yazdırılacak veri bulunamadı!");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000, height=800");

    if (printWindow) {
      const html = generateInvoiceHTML(inv, invoiceType);

      // document.write modern tarayıcılarda head ve script'leri
      // en sağlıklı işleyen yöntemdir (pencere kapandığında akış kesilir)
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Modal'ı kapat ve yönlendir
      setPrintItem(null);
      // navigate("/tahsilatlar"); // İstediğiniz sayfa yolu
    }
  };

  const { year } = useYear();

  console.log("Seçili Yıl: " + year);

  useEffect(() => {
    if (!year) return;

    getMaterials();
    getAllCustomers();

    if (invoiceType == "purchase") {
      getPurchaseInvoiceByYear(year);
    } else {
      getSalesInvoicesByYear(year);
    }
  }, [year, invoiceType, tenant]);

  const invoicesToDisplay = invoiceType === "purchase" ? purchase : sales;

  const filteredInvoices = (
    Array.isArray(invoicesToDisplay) ? invoicesToDisplay : []
  ).filter((inv) => {
    const term = searchTerm.toLowerCase();

    return (
      inv.fileNo?.toString().toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term) ||
      inv.date?.toLowerCase().includes(term)
    );
  });

  const [form, setForm] = useState(null);
  const [totals, setTotals] = useState({ kdvToplam: 0, totalPrice: 0 });

  const prepareEditForm = (invoice) => {
    setForm({
      date: invoice.date,
      fileNo: invoice.fileNo,
      customerId: invoice.customer.id,
      items: invoice.items.map((i) => {
        const lineBase = i.unitPrice * i.quantity;
        // Satın alma ise KDV dahil, Satış ise KDV hariç hesaplama başlangıcı
        const lineTotal =
          invoiceType === "purchase" ? lineBase * (1 + i.kdv / 100) : lineBase;

        return {
          materialId: String(i.material.id),
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          kdv: i.kdv,
          lineTotal: lineTotal,
        };
      }),
    });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    prepareEditForm(invoice);
  };

  const handleItemChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...form.items];
    updated[i] = { ...updated[i], [name]: value };

    const qty = Number(updated[i].quantity) || 0;
    const price = Number(updated[i].unitPrice) || 0;
    const kdv = Number(updated[i].kdv) || 0;

    if (invoiceType === "purchase") {
      // Satın Alma: Toplam = Fiyat * Miktar * (1 + KDV)
      updated[i].lineTotal = price * qty * (1 + kdv / 100);
    } else {
      // Satış: Toplam = Fiyat * Miktar (KDV sonra ekleniyor)
      updated[i].lineTotal = price * qty;
    }

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

  useEffect(() => {
    if (!form) return;

    const total = form.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const kdvMiktari = form.items.reduce((sum, i) => {
      const base = Number(i.unitPrice) * Number(i.quantity);
      return sum + (base * Number(i.kdv)) / 100;
    }, 0);
    setTotals({ totalPrice: total, kdvToplam: kdvMiktari });
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
      getPurchaseInvoiceByYear(year);
    } else {
      await editSalesInvoice(editingInvoice.id, payload);
      getSalesInvoicesByYear(year);
    }

    setEditingInvoice(null);
    setForm(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (invoiceType === "purchase") {
      await deletePurchaseInvoice(deleteTarget.id);
      getPurchaseInvoiceByYear(year);
    } else {
      await deleteSalesInvoice(deleteTarget.id);
      getSalesInvoicesByYear(year);
    }

    setDeleteTarget(null);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handlePriceSelect = (index, price) => {
    const updated = [...form.items];
    updated[index].unitPrice = price;

    const qty = Number(updated[index].quantity) || 0;
    const kdv = Number(updated[index].kdv) || 0;

    if (invoiceType === "purchase") {
      updated[index].lineTotal = price * qty * (1 + kdv / 100);
    } else {
      updated[index].lineTotal = price * qty;
    }

    setForm({ ...form, items: updated });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ÜST BAŞLIK */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fatura Yönetimi
            </h1>
            <p className="text-gray-400 mt-2">
              {year} Mali Yılı - Kayıtlı Faturalar
            </p>
          </div>

          <select
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-3 outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
          >
            <option value="purchase">🛒 Satın Alma Faturaları</option>
            <option value="sales">💰 Satış Faturaları</option>
          </select>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="relative">
          <input
            type="text"
            placeholder="Fatura no, müşteri adı veya tarihe göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900/60 border-2 border-gray-800 rounded-2xl text-white focus:border-blue-500 transition-all outline-none backdrop-blur-sm"
          />
          <svg
            className="w-6 h-6 text-gray-500 absolute left-4 top-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* TABLO */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Fatura No
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Tarih
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Müşteri / Firma
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                    Toplam Tutar
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-24">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-500/5 transition-all group"
                    >
                      <td className="p-5 font-mono text-blue-400 font-bold">
                        {inv.fileNo}
                      </td>
                      <td className="p-5 text-gray-300 font-mono text-sm">
                        {inv.date}
                      </td>
                      <td className="p-5 font-bold text-white">
                        {inv.customer?.name}
                      </td>
                      <td className="p-5 text-right font-mono text-lg font-bold text-emerald-400">
                        ₺{" "}
                        {inv.totalPrice?.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-5 text-center relative">
                        <button
                          onClick={() => toggleMenu(inv.id)}
                          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-all"
                        >
                          ⋮
                        </button>
                        {openMenuId === inv.id && (
                          <div className="absolute right-12 top-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-36 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => {
                                handleEdit(inv);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-500/10 text-sm text-blue-400 flex items-center gap-2"
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(inv);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 border-t border-gray-800 flex items-center gap-2"
                            >
                              🗑️ Sil
                            </button>

                            <button
                              onClick={() => {
                                setPrintItem(inv);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 border-t border-gray-800 flex items-center gap-2"
                            >
                              Yazdır
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-20 text-center text-gray-600 italic"
                    >
                      {year} yılına ait kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DÜZENLEME MODALI */}
        {editingInvoice && form && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
            <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[3rem] w-full max-w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3">
                <span className="p-2 bg-blue-600 rounded-xl text-xl">📝</span>
                Faturayı Güncelle
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
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                    Belge No
                  </label>
                  <input
                    type="text"
                    value={form.fileNo}
                    onChange={(e) =>
                      setForm({ ...form, fileNo: e.target.value })
                    }
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                    Müşteri / Firma
                  </label>
                  <select
                    value={form.customerId}
                    onChange={(e) =>
                      setForm({ ...form, customerId: e.target.value })
                    }
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-3 text-white focus:border-blue-500 outline-none transition cursor-pointer"
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
                      <th className="p-5 text-xs font-bold uppercase text-center text-center">
                        Birim Fiyat
                      </th>
                      <th className="p-5 text-xs font-bold uppercase w-32">
                        Miktar
                      </th>
                      <th className="p-5 text-xs font-bold uppercase px-7">
                        KDV %
                      </th>
                      <th className="px-4 py-2 text-right">
                        {invoiceType === "purchase"
                          ? "Toplam (Dahil)"
                          : "Toplam"}
                      </th>
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
                          <div className="flex items-center gap-2 flex-nowrap min-w-[140px]">
                            <input
                              type="number"
                              name="unitPrice"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(i, e)}
                              className="flex-1  bg-gray-900 border border-gray-700 rounded-lg px-1 py-2 text-white focus:border-blue-500 outline-none min-w-0
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ..."
                            />
                            <MaterialPriceTooltip
                              materialId={item.materialId}
                              onSelect={(p) => handlePriceSelect(i, p)}
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
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-500 md:hidden uppercase font-bold">
                              KDV %
                            </label>
                            <input
                              type="number"
                              name="kdv"
                              value={item.kdv}
                              onChange={(e) => handleItemChange(i, e)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ..."
                              placeholder="20"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                          {item.lineTotal.toFixed(2)} ₺
                        </td>
                        <td className="px-4 py-3 rounded-r-xl text-center">
                          {form.items.length > 1 && (
                            <button
                              onClick={() => removeItem(i)}
                              className="text-gray-500 hover:text-red-500 transition-colors"
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
                  {invoiceType === "sales" ? (
                    <>
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>Ara Toplam:</span>
                        <span className="font-mono">
                          {totals.totalPrice.toFixed(2)} ₺
                        </span>
                      </div>
                      <div className="flex justify-between text-blue-400 text-sm font-semibold">
                        <span>Hesaplanan KDV:</span>
                        <span className="font-mono">
                          +{totals.kdvToplam.toFixed(2)} ₺
                        </span>
                      </div>
                      <div className="flex justify-between text-2xl font-black pt-3 border-t border-gray-700 mt-2">
                        <span className="text-white">Genel Toplam:</span>
                        <span className="text-emerald-400">
                          {(totals.totalPrice + totals.kdvToplam).toFixed(2)} ₺
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Satın almada KDV dahil olsa bile içindeki KDV'yi üstte gösteriyoruz */}
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>Toplam KDV Tutarı:</span>
                        <span className="font-mono text-blue-400">
                          {totals.kdvToplam.toFixed(2)} ₺
                        </span>
                      </div>
                      <div className="flex justify-between text-2xl font-black pt-3 border-t border-gray-700 mt-2">
                        <span className="text-white font-bold">
                          Genel Toplam:
                        </span>
                        <span className="text-blue-400">
                          {totals.totalPrice.toFixed(2)} ₺
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 font-bold">
                <button
                  onClick={() => {
                    setEditingInvoice(null);
                    setForm(null);
                  }}
                  className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl hover:bg-gray-700 transition"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl transition shadow-blue-600/20"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SİLME ONAY MODALI */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[110] backdrop-blur-md">
            <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl animate-in zoom-in duration-300 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Faturayı Sil
              </h2>
              <p className="mb-8 text-gray-400 leading-relaxed">
                <b>{deleteTarget.fileNo}</b> numaralı fatura kalıcı olarak
                silinecektir. Emin misiniz?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700 transition"
                >
                  Vazgeç
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg shadow-red-600/20 transition"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {printItem && (
          <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] backdrop-blur-sm p-4 md:p-10">
            <div className="bg-[#1a1f2e] border border-gray-800 w-full max-w-5xl max-h-[95vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
              {/* Modal Başlık Paneli */}
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                      👁️
                    </span>
                    Fatura Önizleme
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {printItem.fileNo} numaralı belge kontrol ediliyor
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPrintItem(null)}
                    className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-bold hover:bg-gray-700 transition active:scale-95"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => executePrint(printItem)}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center gap-2"
                  >
                    <span>🖨️</span> Şimdi Yazdır
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-gray-800/30 flex justify-center">
                <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl text-black font-serif origin-top transform scale-[0.85] md:scale-100">
                  <div className="border-b-4 border-black pb-4 mb-8 flex justify-between">
                    <div>
                      <h1 className="text-4xl font-black uppercase italic">
                        FATURA
                      </h1>
                      <p className="font-mono font-bold text-lg">
                        NO: {printItem.fileNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold uppercase">
                        ŞİRKET ADI
                      </h2>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-tight">
                        Adres Bilgileri / Vergi Dairesi
                        <br />
                        Vergi No: 0000000000
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-black rounded-2xl mb-8 w-2/3">
                    <h3 className="text-[9px] font-bold text-gray-400 uppercase border-b mb-1">
                      Müşteri
                    </h3>
                    <p className="font-bold uppercase text-lg leading-tight">
                      {printItem.customer?.name}
                    </p>
                    <p className="text-xs mt-1">
                      {printItem.customer?.address}
                    </p>
                  </div>

                  <table className="w-full text-left text-sm mb-10">
                    <thead>
                      <tr className="border-b-2 border-black font-bold text-[10px] uppercase bg-gray-50">
                        <th className="py-2 px-1">Açıklama</th>
                        <th className="py-2 px-1 text-center">Miktar</th>
                        <th className="py-2 px-1 text-right">Fiyat</th>
                        <th className="py-2 px-1 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {printItem.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-1 font-bold text-xs">
                            {item.material?.code} - {item.material?.comment}
                          </td>
                          <td className="py-3 px-1 text-center font-mono">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-1 text-right font-mono">
                            {item.unitPrice.toLocaleString("tr-TR")} ₺
                          </td>
                          <td className="py-3 px-1 text-right font-black">
                            {(item.unitPrice * item.quantity).toLocaleString(
                              "tr-TR"
                            )}{" "}
                            ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-64 space-y-1">
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="text-gray-500 font-bold">
                          ARA TOPLAM:
                        </span>
                        <span className="font-mono">
                          {printItem.totalPrice.toFixed(2)} ₺
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="text-gray-500 font-bold">
                          KDV TOPLAM:
                        </span>
                        <span className="font-mono">
                          {printItem.kdvToplam?.toFixed(2) || 0} ₺
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-black pt-2">
                        <span className="text-xs self-center">
                          GENEL TOPLAM:
                        </span>
                        <span>
                          {(invoiceType === "sales"
                            ? printItem.totalPrice + (printItem.kdvToplam || 0)
                            : printItem.totalPrice
                          ).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          ₺
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
