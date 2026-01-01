import { useEffect, useState } from "react";
import { useClient } from "../../backend/store/useClient.js";
import { useReceivedCollection } from "../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../backend/store/usePaymentCompany.js";
import { useYear } from "../context/YearContext.jsx";
import CustomerSearchSelect from "../components/CustomerSearchSelect.jsx";

export default function CollectionPage() {
  const { customers, getAllCustomers } = useClient();
  const { year } = useYear();
  const {
    collections,
    addCollection,
    editCollection,
    deleteReceivedCollection,
    getReceivedCollectionsByYear,
  } = useReceivedCollection();
  const {
    payments,
    addPayment,
    editPayment,
    deletePaymentCompany,
    getPaymentCollectionsByYear,
  } = usePaymentCompany();

  const [type, setType] = useState("received"); // received | payment
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const [addForm, setAddForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    customerId: "",
    price: "",
    comment: "",
  });

  const [editForm, setEditForm] = useState({
    date: "",
    customerId: "",
    price: "",
    comment: "",
  });

  useEffect(() => {
    if (!year) return;

    getAllCustomers();
    getReceivedCollectionsByYear(year);
    getPaymentCollectionsByYear(year);
  }, [year]);

  const shownList = type === "received" ? collections : payments;

  const filteredList = (Array.isArray(shownList) ? shownList : []).filter(
    (item) => {
      const text = search.toLowerCase();

      return (
        item.customer?.name?.toLowerCase().includes(text) ||
        item.comment?.toLowerCase().includes(text) ||
        item.date?.toLowerCase().includes(text) ||
        String(item.price).includes(text)
      );
    }
  );

  const handleAdd = async (e) => {
    e.preventDefault();

    const customerId = Number(addForm.customerId);
    const price = Number(addForm.price);

    const payload = {
      date: addForm.date,
      comment: addForm.comment,
      price: price,
      customer: {
        id: customerId,
      },
    };

    if (type === "received") {
      await addCollection(customerId, payload);
      await getReceivedCollectionsByYear(year);
    } else {
      await addPayment(customerId, payload);
      await getPaymentCollectionsByYear(year);
    }

    setAddForm({
      date: new Date().toISOString().slice(0, 10),
      customerId: "",
      price: "",
      comment: "",
    });
  };

  const handleEdit = (item) => {
    setEditing(item);
    setEditForm({
      date: item.date,
      customerId: item.customer?.id || "",
      price: item.price,
      comment: item.comment,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const customerId = Number(editForm.customerId);
    const price = Number(editForm.price);

    const payload = {
      id: editing.id,
      date: editForm.date,
      comment: editForm.comment,
      price: price,
      customer: {
        id: customerId,
      },
    };

    if (type === "received") {
      await editCollection(payload.id, payload);
      await getReceivedCollectionsByYear(year);
    } else {
      await editPayment(payload.id, payload);
      await getPaymentCollectionsByYear(year);
    }

    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (type === "received") {
      await deleteReceivedCollection(deleteTarget.id);
      await getReceivedCollectionsByYear(year);
    } else {
      await deletePaymentCompany(deleteTarget.id);
      await getPaymentCollectionsByYear(year);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Üst Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Finansal İşlemler
            </h1>
            <p className="text-gray-400 mt-2">
              {year} Mali Yılı Tahsilat ve Ödeme Yönetimi
            </p>
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 text-white rounded-2xl px-6 py-3 outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
          >
            <option value="received">⬇️ Alınan Tahsilatlar</option>
            <option value="payment">⬆️ Firmaya Ödemeler</option>
          </select>
        </div>

        {/* Arama ve Ekleme Formu Kartı */}
        <div className="grid grid-cols-1 gap-8">
          <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] ">
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
              {type === "received"
                ? "Yeni Tahsilat Girişi"
                : "Yeni Ödeme Girişi"}
            </h3>

            <form
              onSubmit={handleAdd} // İşlemi butondan alıp buraya verdik
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
                  onChange={(e) =>
                    setAddForm({ ...addForm, date: e.target.value })
                  }
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
                  onChange={(e) =>
                    setAddForm({ ...addForm, price: e.target.value })
                  }
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
        </div>
      </div>

      {/* Liste Tablosu */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            İşlem Geçmişi
          </h3>
          <input
            type="text"
            placeholder="Listede ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Tarih
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Müşteri / Firma
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest">
                    Açıklama
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                    Tutar
                  </th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-24">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-500/5 transition-all group"
                    >
                      <td className="p-5 text-gray-300 font-mono text-sm">
                        {item.date}
                      </td>
                      <td className="p-5 font-bold text-white max-w-[300px] truncate">
                        {item.customer?.name}
                      </td>
                      <td className="p-5 text-gray-400 text-sm max-w-[250px] truncate">
                        {item.comment || "-"}
                      </td>
                      <td className="p-5 text-right">
                        <span
                          className={`text-lg font-bold font-mono ${
                            type === "received"
                              ? "text-emerald-400"
                              : "text-orange-400"
                          }`}
                        >
                          ₺{" "}
                          {Number(item.price).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="p-5 text-center relative">
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-all"
                        >
                          ⋮
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute right-12 top-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-36 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => {
                                handleEdit(item);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-500/10 text-sm text-blue-400 flex items-center gap-2"
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(item);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 border-t border-gray-800 flex items-center gap-2"
                            >
                              🗑️ Sil
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
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md">
          <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl transform transition-all animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              Kaydı Sil
            </h2>
            <p className="mb-8 text-gray-400 text-center leading-relaxed">
              <b className="text-white">{deleteTarget.customer?.name}</b> için
              oluşturulan
              <span className="text-red-400 font-mono block text-xl mt-2 font-bold italic">
                {Number(deleteTarget.price).toLocaleString()} ₺
              </span>
              tutarındaki bu işlem kalıcı olarak silinecektir. Emin misiniz?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg shadow-red-600/20 transition"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
          <form
            onSubmit={handleSave}
            className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[550px] shadow-2xl animate-in fade-in zoom-in duration-300"
          >
            <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-xl text-xl">📝</span>
              İşlemi Güncelle
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                    Tarih
                  </label>
                  <input
                    required
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                    Tutar (₺)
                  </label>
                  <input
                    required
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                  Müşteri / Firma
                </label>
                <select
                  value={editForm.customerId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customerId: e.target.value })
                  }
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition cursor-pointer"
                >
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                  Açıklama
                </label>
                <textarea
                  rows="3"
                  value={editForm.comment || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, comment: e.target.value })
                  }
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition resize-none"
                  placeholder="İşlem detaylarını buraya yazın..."
                ></textarea>
              </div>
            </div>
            <div className="flex gap-4 mt-10 font-bold">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl hover:bg-gray-700 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                onClick={handleSave}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
