import { useEffect, useState } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";

export default function MaterialList() {
  const { materials, getMaterials, updateMaterials } = useMaterial();
  const [editMaterial, setEditMaterial] = useState(null);

  useEffect(() => {
    getMaterials();
  }, [getMaterials]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditMaterial({ ...editMaterial, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateMaterials(editMaterial.id, editMaterial);
    setEditMaterial(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Malzeme Listesi
      </h2>

      {/* Düzenleme Formu */}
      {editMaterial && (
        <form
          onSubmit={handleUpdate}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
        >
          <h3 className="text-lg font-medium mb-3 text-gray-600">
            Malzeme Düzenle (ID: {editMaterial.id})
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <input
              name="code"
              value={editMaterial.code}
              onChange={handleEditChange}
              placeholder="Kod"
              className="border rounded-lg p-2"
            />
            <input
              name="comment"
              value={editMaterial.comment}
              onChange={handleEditChange}
              placeholder="Açıklama"
              className="border rounded-lg p-2"
            />
            <select
              name="unit"
              value={editMaterial.unit}
              onChange={handleEditChange}
              className="border rounded-lg p-2"
            >
              <option value="KG">KG</option>
              <option value="ADET">ADET</option>
              <option value="M">M</option>
            </select>
          </div>
          <div className="flex justify-end mt-3 space-x-3">
            <button
              type="button"
              onClick={() => setEditMaterial(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Liste Tablosu */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Kod</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Açıklama
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Birim
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center">
              Düzenle
            </th>
          </tr>
        </thead>
        <tbody>
          {materials.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="text-center py-4 text-gray-500 border border-gray-300"
              >
                Henüz malzeme eklenmemiş.
              </td>
            </tr>
          ) : (
            materials?.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition">
                <td className="border border-gray-300 px-4 py-2">{m.id}</td>
                <td className="border border-gray-300 px-4 py-2">{m.code}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {m.comment}
                </td>
                <td className="border border-gray-300 px-4 py-2">{m.unit}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    onClick={() => setEditMaterial(m)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
