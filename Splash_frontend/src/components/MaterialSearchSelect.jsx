//Fatura oluşturma sayfası için malzeme seçme alanı

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function MaterialSearchSelect({
  materials = [],
  value,
  onChange,
  placeholder = "Malzeme ara...",
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedMaterial = (Array.isArray(materials) ? materials : []).find(
    (m) => String(m?.id) === String(value),
  );

  const filtered = (Array.isArray(materials) ? materials : []).filter(
    (m) =>
      (m?.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.comment || "").toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open && inputRef.current) {
      const updatePos = () => {
        const rect = inputRef.current.getBoundingClientRect();
        setPos({
          top: rect.bottom + window.scrollY + 5,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };
      updatePos();
      window.addEventListener("scroll", updatePos);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos);
        window.removeEventListener("resize", updatePos);
      };
    }
  }, [open]);

  // 2. Dışarı Tıklayınca Kapatma (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        value={
          open
            ? search
            : selectedMaterial
              ? `${selectedMaterial?.code || ""} – ${selectedMaterial?.comment || ""}`
              : ""
        }
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        // Koyu Tema Sınıfları
        className="w-full bg-gray-900/60 border-2 border-gray-800 text-white rounded-xl px-4 py-2 focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
      />

      {open &&
        pos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 9999,
            }}
            // Dropdown Koyu Tema Sınıfları
            className="max-h-60 overflow-y-auto rounded-xl border border-gray-800 bg-[#0f172a] shadow-2xl animate-in fade-in zoom-in duration-200 custom-scrollbar"
          >
            {materials.length === 0 ? (
              <div className="p-4 text-sm text-blue-400 animate-pulse">
                Malzemeler yükleniyor...
              </div>
            ) : (
              filtered.length === 0 && (
                <div className="p-4 text-sm text-gray-500 italic">
                  Sonuç bulunamadı
                </div>
              )
            )}

            {(Array.isArray(filtered) ? filtered : []).map((m) => (
              <div
                key={m?.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className="cursor-pointer p-3 border-b border-gray-800/50 hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-sm text-gray-300 flex flex-col"
              >
                <span className="font-bold text-white group-hover:text-blue-400">
                  {m.code || 0}
                </span>
                <span className="text-xs text-gray-500 mt-1">{m.comment}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
