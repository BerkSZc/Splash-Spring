import { useEffect, useRef, useState } from "react";
import { useTenant } from "../context/TenantContext";
import { useCompany } from "../../backend/store/useCompany";

const CompanyDropDown = () => {
  const { tenant, changeTenant } = useTenant();
  const { companies, getAllCompanies } = useCompany();

  const [open, setOpen] = useState(false);

  const dropDownRef = useRef(null);

  const currentCompanyName =
    companies.find((c) => c.schemaName === tenant)?.name || tenant;

  useEffect(() => {
    if (companies.length === 0) {
      getAllCompanies();
    }

    const handleOutsideClick = (event) => {
      if (
        open &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      )
        setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropDownRef}>
      {/* BUTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
        top-2 right-2
          flex items-center gap-2
          bg-indigo-600 text-white
          px-3 py-1
          rounded-full
          text-sm font-bold
          shadow-lg hover:bg-indigo-500 transition-all
          leading-none
        "
      >
        <span className="text-xs">🏢</span>
        <span className="max-w-[100px]">
          {currentCompanyName.toUpperCase()}
        </span>
        <span className="text-[10px] opacity-70">▼</span>
      </button>

      {/* DROPDOWN LİSTESİ */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Şirket Seçimi
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  changeTenant(c.schemaName);
                  setOpen(false);
                  // Seçimden sonra sayfayı yenilemek gerekebilir (Axios interceptor'ın yeni tenant'ı görmesi için)
                  window.location.reload();
                }}
                className={`
                  w-full text-left px-4 py-3 text-sm transition-colors
                  flex items-center justify-between
                  ${
                    c.schemaName === tenant
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex flex-col">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {c.schemaName}
                  </span>
                </div>
                {c.schemaName === tenant && (
                  <span className="text-indigo-600 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDropDown;
