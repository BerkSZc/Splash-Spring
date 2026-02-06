//Navbar daki sağ üst tarafta yıl seçim ekranı

import { useEffect, useRef, useState } from "react";
import { useYear } from "../context/YearContext";

export default function YearDropdown() {
  const { year, years, changeYear } = useYear();
  const [open, setOpen] = useState(false);

  const dropDownRef = useRef(null);

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
        📅 {year}
        <span className="text-xs">▼</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border z-[9999]">
          {Array.isArray(years) &&
            years.map((y) => (
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
