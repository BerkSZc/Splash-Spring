import { useTransferLogic } from "./hooks/useTransferLogic";
import { CompanyCard } from "./components/CompanyCard";
import { YearManager } from "./components/YearManager";
import { CompanyForm } from "./components/CompanyForm";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { CompanyEditModal } from "./components/CompanyEditModal.jsx";

const CompanyPage = () => {
  const { state, handlers } = useTransferLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-6xl mx-auto space-y-12">
        {/* BAŞLIK */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-extrabold text-white">
              Çalışma Alanı Yönetimi
            </h1>
            <p className="text-gray-400 text-lg">
              Şirket seçimi yapın ve mali dönemleri yönetin.
            </p>
          </div>

          {!state.showCompanyForm && (
            <button
              onClick={() => handlers.setShowCompanyForm(true)}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 active:scale-95 shadow-2xl bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500 animate-in fade-in zoom-in duration-300 whitespace-nowrap"
            >
              <span className="text-base">+</span> YENİ ŞİRKET
            </button>
          )}
        </div>

        {/* 1. BÖLÜM: ŞİRKET EKLEME FORMU */}
        {state.showCompanyForm && (
          <div className="relative animate-in fade-in zoom-in-95 duration-300">
            <CompanyForm
              newCompData={state.newCompData}
              setNewCompData={handlers.setNewCompData}
              onCreate={handlers.handleCreateCompany}
              onCancel={() => handlers.setShowCompanyForm(false)}
            />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 2. BÖLÜM: ŞİRKET LİSTESİ */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Aktif Şirketler{" "}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(Array.isArray(state.companies) ? state.companies : [])?.map(
                (c) => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    isSelected={state.tenant === c.schemaName}
                    onSelect={() => handlers.handleGoToCompany(c.id)}
                    onEdit={handlers.handleStartEdit}
                  />
                ),
              )}
            </div>
          </div>

          {/* 3. BÖLÜM: YIL YÖNETİMİ */}
          <YearManager
            year={state.year}
            years={state.years}
            newYear={state.newYear}
            isModalOpen={state.isModalOpen}
            confirmCheck={state.confirmCheck}
            deleteTarget={state.deleteTarget}
            confirmDeleteCheck={state.confirmDeleteCheck}
            shouldTransfer={state.shouldTransfer}
            onYearChange={handlers.changeYear}
            onYearAdd={handlers.handleAddYearClick}
            onConfirmModal={handlers.confirmAndAddYear}
            onDeleteYear={handlers.handleDeleteYear}
            onCloseModal={() => handlers.setIsModalOpen(false)}
            onCloseDelete={handlers.handleCloseDelete}
            onNewYearChange={handlers.setNewYear}
            onSetConfirmCheck={handlers.setConfirmCheck}
            onSetDeleteTarget={handlers.setDeleteTarget}
            onSetConfirmDeleteCheck={handlers.setConfirmDeleteCheck}
          />

          {/* MODAL */}
          {state.editingCompany && (
            <CompanyEditModal
              isOpen={!!state.editingCompany}
              data={state.editingCompany}
              onChange={handlers.setEditingCompany}
              onSave={handlers.handleUpdateCompany}
              onCancel={() => handlers.setEditingCompany(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
