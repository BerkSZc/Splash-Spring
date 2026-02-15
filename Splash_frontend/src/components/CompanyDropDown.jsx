import { useEffect, useRef, useState } from "react";
import { useTenant } from "../context/TenantContext";
import { useCompany } from "../../backend/store/useCompany";
import toast from "react-hot-toast";

const CompanyDropDown = () => {
  const { tenant, changeTenant } = useTenant();
  const {
    companies,
    getAllCompanies,
    loading: companiesLoading,
  } = useCompany();

  const [open, setOpen] = useState(false);

  const dropDownRef = useRef(null);

  const currentCompanyName =
    (Array.isArray(companies) ? companies : []).find(
      (c) => c?.schemaName === tenant,
    )?.name || tenant;

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        if (companies?.length === 0) {
          await getAllCompanies();
        }
        if (ignore) return;
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [companies?.length]);

  useEffect(() => {
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

  const isLoading = companiesLoading;

  return (
    <div className="relative" ref={dropDownRef}>
      {/* BUTON */}
      <button
        disabled={isLoading}
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
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <span className="text-xs">🏢</span>
        )}
        <span className="max-w-[100px]">
          {isLoading ? "YÜKLENİYOR..." : currentCompanyName.toUpperCase()}
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
            {isLoading ? (
              <div className="p-4 text-center text-xs text-gray-400 italic">
                Şirketler getiriliyor...
              </div>
            ) : (
              (Array.isArray(companies) ? companies : []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    changeTenant(c?.schemaName);
                    setOpen(false);
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
                    <span>{c?.name || ""}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {c?.schemaName || ""}
                    </span>
                  </div>
                  {c.schemaName === tenant && (
                    <span className="text-indigo-600 font-bold">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDropDown;
