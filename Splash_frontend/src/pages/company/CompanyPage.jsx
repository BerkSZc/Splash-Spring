import { useTransferLogic } from "./hooks/useTransferLogic";
import { CompanyCard } from "./components/CompanyCard";
import { YearManager } from "./components/YearManager";
import { CompanyForm } from "./components/CompanyForm";

const CompanyPage = () => {
  const { state, handlers } = useTransferLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* BAŞLIK */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white">
            Çalışma Alanı Yönetimi
          </h1>
          <p className="text-gray-400 text-lg">
            Şirket seçimi yapın ve mali dönemleri yönetin.
          </p>
        </div>

        {/* 1. BÖLÜM: ŞİRKET EKLEME FORMU */}
        <CompanyForm
          newCompData={state.newCompData}
          setNewCompData={handlers.setNewCompData}
          onCreate={handlers.handleCreateCompany}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 2. BÖLÜM: ŞİRKET LİSTESİ */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Aktif Şirketler{" "}
              {state.isLoading && (
                <span className="text-sm text-gray-500 animate-pulse">
                  (Yükleniyor...)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {state.companies?.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  isSelected={state.tenant === c.schemaName}
                  onSelect={handlers.changeTenant}
                />
              ))}
            </div>
          </div>

          {/* 3. BÖLÜM: YIL YÖNETİMİ */}
          <YearManager
            year={state.year}
            years={state.years}
            newYear={state.newYear}
            shouldTransfer={state.shouldTransfer}
            onYearChange={handlers.changeYear}
            onYearRemove={handlers.removeYear}
            onTransferChange={handlers.setShouldTransfer}
            onYearAdd={handlers.handleAddYear}
            onNewYearChange={handlers.setNewYear}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
