import { useEffect, useState, useRef } from "react";
import { useClient } from "../../backend/store/useClient";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice";
import { usePaymentCompany } from "../../backend/store/usePaymentCompany";
import { useReceivedCollection } from "../../backend/store/useReceivedCollection";
import { useYear } from "../context/YearContext";
import { accountStatementHelper } from "../utils/accountStatementHelper";
import { generateStatementHTML } from "../utils/statementPrintHelpers";

export default function ClientsPage() {
  const {
    customers,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    setArchived,
  } = useClient();

  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    balance: 0,
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
  });

  const [archiveAction, setArchiveAction] = useState("archive");
  const [contextMenu, setContextMenu] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Ekstre State'leri
  const [statementData, setStatementData] = useState([]);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] =
    useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const { sales, getSalesInvoicesByYear } = useSalesInvoice();
  const { purchase, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { payments, getPaymentCollectionsByYear } = usePaymentCompany();
  const { collections, getReceivedCollectionsByYear } = useReceivedCollection();
  const { year } = useYear();

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenStatement = async (customer) => {
    setOpenMenuId(null);
    await Promise.all([
      getSalesInvoicesByYear(year),
      getPurchaseInvoiceByYear(year),
      getPaymentCollectionsByYear(year),
      getReceivedCollectionsByYear(year),
    ]);

    const data = accountStatementHelper(
      customer,
      sales,
      purchase,
      payments,
      collections,
      year
    );
    setStatementData(data);
    setSelectedCustomerForStatement(customer);
    setShowPrintModal(true);
  };

  const handleStatementPrint = () => {
    if (!selectedCustomerForStatement) return;
    const html = generateStatementHTML(
      selectedCustomerForStatement,
      statementData,
      year
    );
    const printWindow = window.open("", "_blank", "width=1000, height=800");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setShowPrintModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editClient) {
      updateCustomer(editClient.id, form);
      setEditClient(null);
    } else {
      addCustomer(form);
    }
    setForm({
      name: "",
      balance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const handleEdit = (customer) => {
    if (customer.archived) return;
    setEditClient(customer);
    setForm({
      name: customer.name || "",
      balance: customer.balance || "",
      address: customer.address || "",
      country: customer.country || "",
      local: customer.local || "",
      district: customer.district || "",
      vdNo: customer.vdNo || "",
    });
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditClient(null);
    setForm({
      name: "",
      balance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const filteredCustomers = Array.isArray(customers)
    ? customers
        .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
        .filter((c) => (showArchived ? c.archived : !c.archived))
    : [];

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleArchiveToggle = async (customer) => {
    await setArchived(customer.id, !customer.archived);
    setOpenMenuId(null);
  };

  const handleCheckboxChange = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleArchiveModal = async () => {
    const archivedValue = archiveAction === "archive";
    for (const id of selectedCustomers) {
      await setArchived(id, archivedValue);
    }
    setSelectedCustomers([]);
    setShowArchiveModal(false);
    setOpenMenuId(null);
  };

  useEffect(() => {
    setSelectedCustomers([]);
    setContextMenu(null);
    setOpenMenuId(null);
  }, [showArchived]);

  const selectedList = filteredCustomers.filter((c) =>
    selectedCustomers.includes(c.id)
  );

  return (
    <div className="min-h-screen w-full bg-[#030712] text-gray-100 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ÜST BAŞLIK */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Müşteri Yönetimi
            </h1>
            <p className="text-gray-400 text-lg">
              Portföyünüzü ve bakiye durumlarını kontrol edin.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 bg-gray-900/40 border-2 border-gray-800 rounded-2xl w-full text-white focus:border-blue-500 transition-all outline-none"
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-4 top-3.5"
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

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                showArchived
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20"
              }`}
            >
              {showArchived ? "Aktif Listeye Dön" : "Arşivdekiler"}
            </button>
          </div>
        </div>

        {/* FORM KARTI */}
        <div
          className={`p-8 bg-gray-900/20 border rounded-[2.5rem] transition-all duration-500 ${
            editClient ? "border-blue-500/40 bg-blue-500/5" : "border-gray-800"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-8 flex items-center gap-3 ${
              editClient ? "text-blue-400" : "text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-7 rounded-full ${
                editClient ? "bg-blue-500" : "bg-emerald-500"
              }`}
            ></span>
            {editClient
              ? "Müşteri Bilgilerini Güncelle"
              : "Yeni Müşteri Tanımla"}
          </h3>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[
              ["name", "Müşteri Unvanı", "text"],
              ["balance", "Açılış Bakiyesi", "number"],
              ["country", "Ülke", "text"],
              ["local", "İl", "text"],
              ["district", "İlçe", "text"],
              ["vdNo", "Vergi No", "text"],
            ].map(([key, label, type]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full bg-gray-900/60 border-2 border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                />
              </div>
            ))}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Tam Adres
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full bg-gray-900/60 border-2 border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div className="md:col-span-4 flex justify-end gap-4 pt-4 mt-2 border-t border-gray-800/50">
              {editClient && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-8 py-3 text-gray-400 font-bold rounded-xl hover:bg-gray-800 transition-all"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className={`px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg ${
                  editClient
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {editClient ? "Güncelle" : "Sisteme Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLO */}
        <div className="space-y-6">
          <div className="bg-gray-900/20 border border-gray-800 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/40 text-gray-400 border-b border-gray-800">
                    <th className="p-5 w-12 text-center"></th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Unvan / Adres
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest">
                      Bölge
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                      Bakiye
                    </th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-center">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          customer: c,
                        });
                        if (!selectedCustomers.includes(c.id))
                          setSelectedCustomers([c.id]);
                      }}
                      className={`group transition-all ${
                        c.archived
                          ? "opacity-40 grayscale bg-gray-950"
                          : "hover:bg-blue-500/5"
                      }`}
                    >
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(c.id)}
                          onChange={() => handleCheckboxChange(c.id)}
                          className="w-5 h-5 rounded-lg accent-blue-500 bg-gray-800 border-gray-700"
                        />
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-white text-lg">
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {c.address || "Adres yok"}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-gray-300 text-sm">
                          {c.local} / {c.district}
                        </div>
                        <div className="text-[10px] text-blue-500 uppercase font-bold mt-1 tracking-widest">
                          {c.country}
                        </div>
                      </td>
                      <td className="p-5 text-right font-mono">
                        <span
                          className={`text-lg font-bold ${
                            Number(c.balance) < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          ₺{" "}
                          {Number(c.balance || 0).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="p-5 text-center relative">
                        <button
                          onClick={() => toggleMenu(c.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 transition-all"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {openMenuId === c.id && (
                          <div className="absolute right-full top-0 mr-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-48 z-[100] overflow-hidden backdrop-blur-xl">
                            {!c.archived && (
                              <button
                                onClick={() => handleEdit(c)}
                                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-gray-300"
                              >
                                <svg
                                  className="w-4 h-4 text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Düzenle
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenStatement(c)}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 border-t border-gray-800"
                            >
                              <span className="text-blue-400">📊</span> Hesap
                              Ekstresi
                            </button>
                            <button
                              onClick={() => handleArchiveToggle(c)}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-orange-400 border-t border-gray-800"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              {c.archived ? "Arşivden Çıkar" : "Arşivle"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ARŞİV MODAL - DARK */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[200] backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] w-[400px] shadow-2xl text-center">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Emin misiniz?</h3>
            <p className="text-gray-400 mb-8">
              <strong>{selectedCustomers.length}</strong> müşteri{" "}
              {archiveAction === "archive"
                ? "arşivlenecek."
                : "arşivden çıkarılacak."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-bold"
              >
                Vazgeç
              </button>
              <button
                onClick={handleArchiveModal}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXT MENU - DARK */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[150]"
          onClick={() => setContextMenu(null)}
        >
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="absolute bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl w-56 overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedCustomers.length === 1 && (
              <button
                onClick={() => {
                  handleEdit(contextMenu.customer);
                  setContextMenu(null);
                }}
                className="block w-full text-left px-4 py-3 hover:bg-blue-600 text-sm text-white"
              >
                Düzenle
              </button>
            )}
            <button
              onClick={() => {
                setArchiveAction(
                  selectedList.every((c) => c.archived)
                    ? "unarchive"
                    : "archive"
                );
                setShowArchiveModal(true);
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-orange-400 border-t border-gray-800"
            >
              {selectedList.every((c) => c.archived)
                ? "Seçilenleri Arşivden Çıkar"
                : "Seçilenleri Arşivle"}
            </button>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL - DARK BACKGROUND */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black flex justify-center items-center z-[300] p-4 md:p-10 overflow-hidden">
          <div className="bg-gray-900 w-full max-w-6xl max-h-full rounded-[2.5rem] flex flex-col border border-gray-800 shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                📊 Ekstre Önizleme
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-6 py-2.5 bg-gray-800 text-gray-400 rounded-xl font-bold"
                >
                  Kapat
                </button>
                <button
                  onClick={handleStatementPrint}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <span>🖨️</span> Yazdır
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 bg-gray-950 flex justify-center">
              {/* A4 Kağıdı (Burası çıktı için beyaz kalmalı) */}
              <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] text-black shadow-2xl">
                {/* ... İçerik aynı ... */}
                <div className="flex justify-between border-b-4 border-black pb-4 mb-8">
                  <h1 className="text-3xl font-black uppercase">Cari Ekstre</h1>
                  <div className="text-right font-bold">{year}</div>
                </div>
                <div className="mb-8 p-5 border-l-8 border-black bg-gray-50">
                  <h3 className="text-xl font-bold">
                    {selectedCustomerForStatement?.name}
                  </h3>
                  <p className="text-sm">
                    {selectedCustomerForStatement?.address}
                  </p>
                </div>
                <table className="w-full text-[12px]">
                  <thead className="border-y-2 border-black">
                    <tr className="bg-gray-100 uppercase font-bold">
                      <td className="p-2">Tarih</td>
                      <td className="p-2">Açıklama</td>
                      <td className="p-2 text-right">Borç</td>
                      <td className="p-2 text-right">Alacak</td>
                      <td className="p-2 text-right">Bakiye</td>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{item.date}</td>
                        <td className="p-2">{item.desc}</td>
                        <td className="p-2 text-right">
                          {item.debit > 0
                            ? item.debit.toLocaleString("tr-TR")
                            : "-"}
                        </td>
                        <td className="p-2 text-right">
                          {item.credit > 0
                            ? item.credit.toLocaleString("tr-TR")
                            : "-"}
                        </td>
                        <td className="p-2 text-right font-bold">
                          {item.balance.toLocaleString("tr-TR")} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
