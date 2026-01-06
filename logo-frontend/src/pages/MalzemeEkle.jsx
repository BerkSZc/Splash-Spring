/*------------------------------ 
                    KALDIRILCAK
------------------------------*/

import { useEffect, useState, useRef } from "react";
import { useMaterial } from "../../backend/store/useMaterial.js";

export default function MaterialForm() {
  const formRef = useRef(null); // Form için ref

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
    setEditId(item.id);
    setForm({
      code: item.code,
      comment: item.comment,
      unit: item.unit,
    });

    // Formun bulunduğu bölüme kaydır
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter(
    (item) =>
      item.code?.toLowerCase().includes(search.toLowerCase()) ||
      item.comment?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* BAŞLIK */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Malzeme Yönetimi
          </h1>
          <p className="text-gray-400">
            Sistemdeki ürün ve hammadde tanımlarını yönetin.
          </p>
        </div>

        {/* FORM KARTI */}
        <div
          ref={formRef}
          className={`p-8 bg-gray-900/40 border transition-all duration-500 rounded-[2.5rem] ${
            editId
              ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              : "border-gray-800"
          }`}
        >
          <h2
            className={`text-xl font-bold mb-8 flex items-center gap-3 ${
              editId ? "text-blue-400" : "text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-7 rounded-full ${
                editId ? "bg-blue-500" : "bg-emerald-500"
              }`}
            ></span>
            {editId ? "Malzeme Bilgilerini Güncelle" : "Yeni Malzeme Tanımla"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Malzeme Kodu
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                placeholder="Örn: MZ-001"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Birim
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none cursor-pointer"
              >
                <option value="KG">KG</option>
                <option value="ADET">ADET</option>
                <option value="M">METRE (M)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Açıklama
              </label>
              <input
                type="text"
                name="comment"
                value={form.comment}
                onChange={handleChange}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                placeholder="Malzeme detayı giriniz..."
                required
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg ${
                  editId
                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                }`}
              >
                {editId ? "Güncelle" : "Sisteme Kaydet"}
              </button>
            </div>
          </form>
        </div>

        {/* LİSTE ALANI */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Kayıtlı Malzemeler
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Malzeme ara..."
                className="bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 pl-10 text-sm focus:border-blue-500 outline-none transition-all w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="w-4 h-4 text-gray-500 absolute left-3 top-3"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
                <p className="text-gray-500 italic">
                  Aranan kritere uygun malzeme bulunamadı.
                </p>
              </div>
            ) : (
              filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  className="group p-6 bg-gray-900/40 border border-gray-800 rounded-3xl flex justify-between items-center hover:border-gray-600 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.code}
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {item.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-lg text-xs font-mono font-bold tracking-wider">
                      {item.unit}
                    </span>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2.5 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-xl transition-all"
                      title="Düzenle"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
