import { useEffect, useState } from "react";
import { useClient } from "../../backend/store/useClient.js";
import { useReceivedCollection } from "../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../backend/store/usePaymentCompany.js";

export default function CollectionPage() {
  const { customers, getAllCustomers } = useClient();
  const { collections, getCollections, addCollection, editCollection } =
    useReceivedCollection();
  const { payments, getPayments, addPayment, editPayment } =
    usePaymentCompany();

  const [type, setType] = useState("received"); // received | payment
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");

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
    getAllCustomers();
    getCollections();
    getPayments();

    console.log("collections: " + collections);
    console.log("Payments: " + payments);
  }, []);

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

  const handleAdd = async () => {
    const payload = {
      date: addForm.date,
      comment: addForm.comment,
      price: Number(addForm.price),
      customer: {
        id: Number(addForm.customerId),
      },
    };

    const customerId = Number(addForm.customerId);

    if (!customerId) {
      alert("Müşteri seçilmedi!");
      return;
    }

    if (type === "received") {
      await addCollection(customerId, payload);
      getCollections();
    } else {
      await addPayment(customerId, payload);
      getPayments();
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

  const handleSave = async () => {
    const payload = {
      id: editing.id,
      date: editForm.date,
      comment: editForm.comment,
      price: Number(editForm.price),
      customer: {
        id: Number(editForm.customerId),
      },
    };

    if (type === "received") {
      await editCollection(payload.id, payload);
      await getCollections();
    } else {
      await editPayment(payload.id, payload);
      await getPayments();
    }

    setEditing(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-xl">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">
          Tahsilatlar / Ödemeler
        </h2>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="received">Alınan Tahsilatlar</option>
          <option value="payment">Firmaya Ödemeler</option>
        </select>
      </div>

      {/* ------------------------
            ARAMA ALANI
      ------------------------ */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ara (müşteri, açıklama, tarih, tutar...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* ------------------------
            EKLEME FORMU
      ------------------------ */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6 border">
        <h3 className="text-lg font-semibold mb-3">
          {type === "received" ? "Yeni Tahsilat" : "Yeni Ödeme"}
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label>Tarih</label>
            <input
              type="date"
              value={addForm.date}
              onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label>Müşteri</label>
            <select
              value={addForm.customerId}
              onChange={(e) =>
                setAddForm({ ...addForm, customerId: e.target.value })
              }
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Seçiniz</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tutar</label>
            <input
              type="number"
              value={addForm.price}
              onChange={(e) =>
                setAddForm({ ...addForm, price: e.target.value })
              }
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label>Açıklama</label>
            <input
              type="text"
              value={addForm.comment}
              onChange={(e) =>
                setAddForm({ ...addForm, comment: e.target.value })
              }
              className="w-full border p-2 rounded-lg"
            />
          </div>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* ------------------------
            LİSTE TABLOSU
      ------------------------ */}
      <table className="w-full text-sm border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Tarih</th>
            <th className="p-2">Müşteri/Firma</th>
            <th className="p-2">Açıklama</th>
            <th className="p-2">Tutar</th>
            <th className="p-2">İşlem</th>
          </tr>
        </thead>

        <tbody>
          {filteredList?.length ? (
            filteredList.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{c.date}</td>
                <td className="p-2">{c.customer?.name}</td>
                <td className="p-2">{c.comment}</td>
                <td className="p-2">{c.price} ₺</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleEdit(c)}
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

      {/* ------------------------
            DÜZENLEME MODALI
      ------------------------ */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[500px] shadow-xl">
            <h2 className="text-xl font-semibold mb-6">
              {type === "received" ? "Tahsilat Düzenle" : "Ödeme Düzenle"}
            </h2>

            <div className="grid gap-4 mb-4">
              <div>
                <label>Tarih</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label>Müşteri</label>
                <select
                  value={editForm.customerId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customerId: e.target.value })
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

              <div>
                <label>Tutar</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label>Açıklama</label>
                <input
                  type="text"
                  value={editForm.comment}
                  onChange={(e) =>
                    setEditForm({ ...editForm, comment: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
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
