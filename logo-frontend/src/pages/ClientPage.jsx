import { useEffect, useState, useRef } from "react";
import { useClient } from "../../backend/store/useClient";

export default function ClientsPage() {
  const {
    customers,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    setArchived,
  } = useClient();

  const formRef = useRef(null); // Form için ref

  const [form, setForm] = useState({
    name: "",
    balance: 0,
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
  });

  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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

    // Formun bulunduğu bölüme kaydır
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

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white p-6 shadow rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Müşteri Yönetimi
      </h2>

      {/*  ARAMA ALANI */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Müşteri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 w-64"
        />

        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-4 py-2 rounded-lg text-white ${
            showArchived ? "bg-gray-600" : "bg-indigo-600"
          }`}
        >
          {showArchived ? "Aktif Müşteriler" : "Arşivdekiler"}
        </button>
      </div>

      {/* 🧾 Yeni / Düzenle Formu */}
      <form
        ref={formRef} // Form ref burada
        onSubmit={handleSubmit}
        className="grid grid-cols-3 gap-4 items-end mb-8"
      >
        {[
          ["name", "Müşteri Unvanı"],
          ["balance", "Bakiye"],
          ["country", "Ülke"],
          ["local", "İl"],
          ["district", "İlçe"],
          ["address", "Adres"],
          ["vdNo", "Vergi Dairesi No"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm text-gray-600">{label}</label>
            <input
              type={key === "balance" || key === "vdNo" ? "number" : "text"}
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="border rounded-lg w-full p-2"
            />
          </div>
        ))}

        <div className="col-span-3 flex gap-3 mt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editClient ? "Güncelle" : "Ekle"}
          </button>

          {editClient && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              İptal
            </button>
          )}
        </div>
      </form>

      {/*  Liste */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Unvan</th>
              <th className="p-2 text-left">Ülke</th>
              <th className="p-2 text-left">İl</th>
              <th className="p-2 text-left">İlçe</th>
              <th className="p-2 text-left">Adres</th>
              <th className="p-2 text-left">Vergi Dairesi No</th>
              <th className="p-2 text-right">Bakiye (₺)</th>
              <th className="p-2 text-center">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t ${
                    c.archived
                      ? "bg-gray-100 text-gray-400"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.country}</td>
                  <td className="p-2">{c.local}</td>
                  <td className="p-2">{c.district}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">{c.vdNo}</td>
                  <td className="p-2 text-right">
                    {Number(c.balance || 0).toFixed(2)}
                  </td>

                  {/* 3 NOKTA MENÜ */}
                  <td className="p-2 text-center relative">
                    <button
                      onClick={() => toggleMenu(c.id)}
                      className="text-xl px-2 hover:bg-gray-200 rounded"
                    >
                      ⋮
                    </button>

                    {openMenuId === c.id && (
                      <div className="absolute right-6 top-8 bg-white border rounded-lg shadow-lg w-40 z-50">
                        {!c.archived && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Düzenle
                          </button>
                        )}

                        <button
                          onClick={() => handleArchiveToggle(c)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {c.archived ? " Arşivden Çıkar" : " Arşivle"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 p-4 italic"
                >
                  Aramaya uygun müşteri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
