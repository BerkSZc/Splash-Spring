import { useMaterialLogic } from "./hooks/useMaterialLogic.js";
import { MaterialCard } from "./components/MaterialCard";
import { MaterialFormCard } from "./components/MaterialFormCard";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import MaterialEditModal from "./components/MaterialEditModal.jsx";

export default function MaterialForm() {
  const { state, refs, handlers } = useMaterialLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* BAŞLIK */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Malzeme Yönetimi
            </h1>
            <p className="text-gray-400">
              Sistemdeki ürün ve hammadde tanımlarını yönetin.
            </p>
          </div>

          {!state.isOpen && (
            <button
              onClick={() => handlers.setIsOpen(true)}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 shadow-2xl bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 animate-in fade-in zoom-in duration-300"
            >
              <span className="text-lg">+</span> YENİ MALZEME EKLE
            </button>
          )}
        </div>

        <hr className="border-gray-800/50" />

        {/* FORM KARTI (Parçalanmış Bileşen) */}
        {state.isOpen && !state.editId && (
          <MaterialFormCard
            formRef={refs.formRef}
            editId={state?.editId}
            form={state?.form || []}
            onChange={handlers.handleChange}
            onSubmit={handlers.handleSubmit}
            onCancel={handlers.handleCancel}
          />
        )}

        {state.isOpen && state.editId && (
          <MaterialEditModal
            form={state.form}
            onChange={handlers.handleChange}
            onSave={handlers.handleSubmit}
            onCancel={handlers.handleCancel}
          />
        )}

        {/* LİSTE ALANI */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Kayıtlı Malzemeler
            </h3>

            {/* ARAMA ÇUBUĞU */}
            <div className="relative">
              <input
                type="text"
                placeholder="Malzeme ara..."
                className="bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 pl-10 text-sm focus:border-blue-500 outline-none transition-all w-64"
                value={state.search}
                onChange={(e) => handlers.setSearch(e.target.value)}
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
            {Array.isArray(state.filteredMaterials) &&
            state.filteredMaterials.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
                <p className="text-gray-500 italic">
                  Aranan kritere uygun malzeme bulunamadı.
                </p>
              </div>
            ) : (
              (Array.isArray(state.filteredMaterials)
                ? state.filteredMaterials
                : []
              ).map((item) => (
                <MaterialCard
                  key={item.id}
                  item={item || []}
                  onEdit={handlers.handleEdit}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
