import React, { useEffect, useState } from "react";
import { useYear } from "../context/YearContext";
import { useTenant } from "../context/TenantContext.jsx";
import { useCompany } from "../../backend/store/useCompany.js";
import toast from "react-hot-toast";

const TransferOperationPage = () => {
  const { year, years, changeYear, addYear, removeYear } = useYear();
  const { tenant, changeTenant } = useTenant();

  // useCompany store'undan gerekli fonksiyonları ve şirket listesini alıyoruz
  const { addCompany, getAllCompanies, companies, isLoading } = useCompany();

  const [newYear, setNewYear] = useState("");
  const [newCompData, setNewCompData] = useState({
    id: "",
    name: "",
    desc: "",
  });

  // 1. ADIM: Sayfa yüklendiğinde mevcut şirketleri DB'den çek
  useEffect(() => {
    getAllCompanies();
  }, []);

  const handleAddYear = () => {
    if (newYear.trim() && !years.includes(Number(newYear))) {
      addYear(Number(newYear));
      setNewYear("");
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompData.id || !newCompData.name)
      return toast.error("Lütfen şirket kodu ve adını doldurun");

    try {
      // 2. ADIM: Backend'de şemayı oluştur ve logo.company tablosuna kaydet
      await addCompany(newCompData);

      // Formu temizle
      setNewCompData({ id: "", name: "", desc: "" });

      // Şirket listesini veritabanından tekrar çek (Güncel hali için)
      getAllCompanies();
    } catch (error) {
      console.error("Hata:", error);
    }
  };
  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white">
            Çalışma Alanı Yönetimi
          </h1>
          <p className="text-gray-400 text-lg">
            Şirket seçimi yapın ve mali dönemleri yönetin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ÜST: ŞİRKET EKLEME FORMU */}

          <div className="lg:col-span-3 p-8 bg-gray-900/40 border border-dashed border-gray-700 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 text-blue-400">
              Yeni Şirket (Şema) Tanımla
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                placeholder="Şirket Kodu (logo_2)"
                value={newCompData.id}
                onChange={(e) =>
                  setNewCompData({
                    ...newCompData,
                    id: e.target.value.toLowerCase().replace(" ", "_"),
                  })
                }
                className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />

              <input
                placeholder="Şirket Adı"
                value={newCompData.name}
                onChange={(e) =>
                  setNewCompData({ ...newCompData, name: e.target.value })
                }
                className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
              <input
                placeholder="Açıklama"
                value={newCompData.desc}
                onChange={(e) =>
                  setNewCompData({ ...newCompData, desc: e.target.value })
                }
                className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleCreateCompany}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                Sisteme Tanımla
              </button>
            </div>
          </div>

          {/* SOL: DİNAMİK ŞİRKET LİSTESİ */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Aktif Şirketler{" "}
              {isLoading && (
                <span className="text-sm text-gray-500 animate-pulse">
                  (Yükleniyor...)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {companies &&
                companies.map((c) => {
                  const isSelected = tenant === c.schemaName;

                  return (
                    <div
                      key={c.id}
                      onClick={() => changeTenant(c.schemaName)}
                      className={`group cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/5 shadow-[0_0_25px_rgba(59,130,246,0.15)]"
                          : "border-gray-800 bg-gray-900/40 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div
                          className={`p-4 rounded-2xl ${
                            isSelected ? "bg-blue-600" : "bg-gray-800"
                          }`}
                        >
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        {isSelected && (
                          <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
                        )}
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">
                        {c.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {c.description || c.desc}
                      </p>
                      <p className="text-xs text-blue-500 mt-2 font-mono">
                        Şema: {c.schemaName}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* SAĞ: YIL YÖNETİM ALANI */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
              Mali Yıl Yönetimi
            </h3>

            <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-8">
              {/* Yıl Listesi ve Silme */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Kayıtlı Dönemler
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {years
                    .sort((a, b) => b - a)
                    .map((y) => (
                      <div
                        key={y}
                        className={`flex items-center justify-between p-3 rounded-xl transition ${
                          year === y
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-gray-800/50 border border-transparent"
                        }`}
                      >
                        <button
                          onClick={() => changeYear(Number(y))}
                          className={`flex-1 text-left font-semibold ${
                            year === y ? "text-green-400" : "text-gray-300"
                          }`}
                        >
                          {y} Mali Yılı {year === y && "✓"}
                        </button>

                        <button
                          onClick={() => removeYear(y)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Dönemi Sil"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Yeni Yıl Ekleme */}

              <div className="pt-6 border-t border-gray-800 space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Yeni Dönem Aç
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Örn: 2026"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
                  />
                  <button
                    onClick={handleAddYear}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferOperationPage;
