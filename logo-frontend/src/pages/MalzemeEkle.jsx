import { useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial";

export default function MaterialForm() {
  const [form, setForm] = useState({
    code: "",
    comment: "",
    unit: "KG",
  });

  const { addMaterial } = useMaterial();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMaterial(form);
    setForm({});
    console.log("Gönderilen Form:", form);

    // Backend'e göndermek istediğinde buraya fetch/axios ile POST yazıcaz.
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Malzeme Ekle</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CODE */}
        <div>
          <label className="block text-gray-600 mb-1">Malzeme Kodu</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="örn: MZ-001"
            required
          />
        </div>

        {/* COMMENT */}
        <div>
          <label className="block text-gray-600 mb-1">Açıklama</label>
          <input
            type="text"
            name="comment"
            value={form.comment}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="örn: Çelik Boru"
            required
          />
        </div>

        {/* UNIT */}
        <div>
          <label className="block text-gray-600 mb-1">Birim</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="KG">KG</option>
            <option value="ADET">ADET</option>
            <option value="M">M</option>
          </select>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
