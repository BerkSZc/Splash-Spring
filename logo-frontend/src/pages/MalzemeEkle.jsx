import { useEffect, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";

export default function MaterialForm() {
  const [form, setForm] = useState({
    code: "",
    comment: "",
    unit: "KG",
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const { addMaterial, materials, getMaterials, updateMaterials } =
    useMaterial();

  useEffect(() => {
    getMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      await updateMaterials(editId, form);
      setEditId(null);
    } else {
      await addMaterial(form);
    }

    setForm({ code: "", comment: "", unit: "KG" });
    await getMaterials();
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      code: item.code,
      comment: item.comment,
      unit: item.unit,
    });
  };

  const filteredMaterials = materials.filter(
    (item) =>
      item.code?.toLowerCase().includes(search.toLowerCase()) ||
      item.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10 space-y-14">
      {/* FORM */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {editId ? "Malzeme Düzenle" : "Malzeme Ekle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CODE */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Malzeme Kodu
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 text-lg"
              placeholder="örn: MZ-001"
              required
            />
          </div>

          {/* COMMENT */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Açıklama
            </label>
            <input
              type="text"
              name="comment"
              value={form.comment}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 text-lg"
              placeholder="örn: Çelik Boru"
              required
            />
          </div>

          {/* UNIT */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Birim
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 text-lg"
            >
              <option value="KG">KG</option>
              <option value="ADET">ADET</option>
              <option value="M">M</option>
            </select>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
          >
            {editId ? "Güncelle" : "Kaydet"}
          </button>
        </form>
      </div>

      {/* MATERIAL LIST */}
      <div>
        {/* HEADER + SEARCH */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            Kayıtlı Malzemeler
          </h3>

          <input
            type="text"
            placeholder="Ara..."
            className="border px-4 py-2 rounded-lg text-md w-40 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <p className="text-gray-500 text-md">
              Aranan kritere uygun malzeme bulunamadı.
            </p>
          ) : (
            filteredMaterials.map((item) => (
              <div
                key={item._id}
                className="border p-4 rounded-xl flex justify-between items-center bg-gray-100 shadow-sm"
              >
                <div>
                  <p className="text-lg font-semibold">{item.code}</p>
                  <p className="text-md text-gray-700">{item.comment}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-md font-bold text-gray-800">
                    {item.unit}
                  </span>

                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
