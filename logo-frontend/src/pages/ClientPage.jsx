import { useEffect, useState } from "react";
import { useClient } from "../../backend/store/useClient";

export default function ClientsPage() {
  const { customers, getAllCustomers, addCustomer, updateCustomer } =
    useClient();

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

  const handleEdit = (customers) => {
    setEditClient(customers);
    setForm({
      name: customers.name || "",
      balance: customers.balance || "",
      address: customers.address || "",
      country: customers.country || "",
      local: customers.local || "",
      district: customers.district || "",
      vdNo: customers.vdNo || "",
    });
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
    ? customers.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white p-6 shadow rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Müşteri Yönetimi
      </h2>

      {/*  ARAMA ALANI */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Müşteri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 w-64"
        />
      </div>

      {/* 🧾 Yeni / Düzenle Formu */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-3 gap-4 items-end mb-8"
      >
        <div>
          <label className="block text-sm text-gray-600">Müşteri Unvanı</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Bakiye</label>
          <input
            type="number"
            step="0.01"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Ülke</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">İl</label>
          <input
            type="text"
            name="local"
            value={form.local}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">İlçe</label>
          <input
            type="text"
            name="district"
            value={form.district}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Adres</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">
            Vergi Dairesi No
          </label>
          <input
            type="number"
            name="vdNo"
            value={form.vdNo}
            onChange={handleChange}
            className="border rounded-lg w-full p-2"
          />
        </div>

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
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.country}</td>
                  <td className="p-2">{c.local}</td>
                  <td className="p-2">{c.district}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">{c.vdNo}</td>
                  <td className="p-2 text-right">
                    {Number(c.balance || 0).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
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
