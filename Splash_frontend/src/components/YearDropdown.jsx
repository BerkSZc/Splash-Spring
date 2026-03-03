//Navbar daki sağ üst tarafta yıl seçim ekranı

import { useEffect, useRef, useState } from "react";
import { useYear } from "../context/YearContext";
import { useCompany } from "../../backend/store/useCompany";
import { useTenant } from "../context/TenantContext";
import toast from "react-hot-toast";

export default function YearDropdown() {
  const { year, years, changeYear, setYears } = useYear();
  const [open, setOpen] = useState(false);
  const { getAllYearByCompanyId, companies } = useCompany();
  const dropDownRef = useRef(null);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchYears = async () => {
      const selectedCompany = (Array.isArray(companies) ? companies : [])?.find(
        (c) => c?.schemaName === tenant,
      );
      if (selectedCompany?.id) {
        try {
          const data = await getAllYearByCompanyId(selectedCompany.id);
          const yearList = (Array.isArray(data) ? data : []).map(
            (y) => y.yearValue,
          );
          setYears(yearList);
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
  }, [tenant, companies]);

  useEffect(() => {
    //Tıklanan yerin ref içinde olup olmadığını kontrol eder
    const handleOutsideClick = (event) => {
      if (
        open &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      )
        setOpen(false);
    };

    //Bir yere tıklanırsa haberimiz olması için koyarız
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      // Sonrada performans için sileriz.
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropDownRef}>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-1
          bg-blue-600 text-white
          px-3 py-1
          rounded-full
          text-sm font-semibold
          shadow
        "
      >
        📅 {year || new Date().getFullYear()}
        <span className="text-xs">▼</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border z-[9999]">
          {(Array.isArray(years) ? years : []).map((y) => (
            <button
              key={y}
              onClick={() => {
                changeYear(y);
                setOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                ${y === year ? "font-bold text-black" : "text-black"}
              `}
            >
              {y} {y === year && "✓"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
