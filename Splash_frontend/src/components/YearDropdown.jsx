import { useEffect, useRef, useState } from "react";
import { useYear } from "../context/YearContext";
import { useCompany } from "../../backend/store/useCompany";
import { useTenant } from "../context/TenantContext";
import toast from "react-hot-toast";

export default function YearDropdown() {
  const { year, changeYear, setYears } = useYear();
  const [open, setOpen] = useState(false);
  const [rawYearObjects, setRawYearObjects] = useState([]);
  const { getAllYearByCompanyId, switchYear, companies } = useCompany();
  const dropDownRef = useRef(null);
  const { tenant } = useTenant();
  useEffect(() => {
    let ignore = false;
    const fetchYears = async () => {
      const selectedCompany = (Array.isArray(companies) ? companies : [])?.find(
        (c) => c?.schemaName === tenant,
      );

      if (selectedCompany?.id) {
        try {
          const data = await getAllYearByCompanyId(selectedCompany.id);
          if (ignore) return;

          const list = Array.isArray(data) ? data : [];
          setRawYearObjects(list);

          const numericYearList = list.map((y) => Number(y.yearValue));
          setYears(numericYearList);

          const storedYear = Number(localStorage.getItem("year"));

          const isStoredValid = numericYearList.some((y) => y === storedYear);

          if (storedYear && isStoredValid) {
            changeYear(storedYear);
          } else if (numericYearList.length > 0 && !storedYear) {
            changeYear(Math.max(...numericYearList));
          }
        } catch (error) {
          const backendErr =
            error?.response?.data?.exception?.message || "Bilinmeyen Hata";
          toast.error(backendErr);
        }
      }
    };

    if (tenant) {
      fetchYears();
    }
    return () => {
      ignore = true;
    };
  }, [tenant, companies]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        open &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleSelectYear = async (yearObj) => {
    setOpen(false);

    if (Number(year) === Number(yearObj.yearValue)) return;

    try {
      await switchYear(yearObj.id);
      changeYear(yearObj.yearValue);
      toast.success(`${yearObj.yearValue} mali yılına geçildi`);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Mali yıl değiştirilemedi";
      toast.error(backendErr);
    }
  };

  return (
    <div className="relative" ref={dropDownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-1
          bg-blue-600 text-white
          px-3 py-1
          rounded-full
          text-sm font-semibold
          shadow hover:bg-blue-500 transition
        "
      >
        📅 {year}
        <span className="text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-[9999] overflow-hidden">
          {rawYearObjects.length === 0 ? (
            <div className="p-2 text-xs text-gray-400 text-center">Yıl Yok</div>
          ) : (
            rawYearObjects.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectYear(item)}
                className={`
                  w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between transition
                  ${Number(item.yearValue) === Number(year) ? "font-bold text-blue-600 bg-blue-50/50" : "text-gray-800"}
                `}
              >
                <span>{item.yearValue}</span>
                {Number(item.yearValue) === Number(year) && <span>✓</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
