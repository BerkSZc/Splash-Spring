//Fatura oluşturma sayfası için malzeme seçme alanı

import { useState, useRef, useEffect, useMemo } from "react";
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

  const filtered = useMemo(() => {
    return (Array.isArray(materials) ? materials : [])
      .filter((m) => !m.archived)
      .filter((m) => {
        const searchTerm = search.toLocaleLowerCase("tr-TR");

        return (
          (m?.code || "").toLocaleLowerCase("tr-TR").includes(searchTerm) ||
          (m?.comment || "").toLocaleLowerCase("tr-TR").includes(searchTerm)
        );
      });
  }, [materials, search]);

  useEffect(() => {
    if (open && inputRef.current) {
      const updatePos = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setPos({
          top: rect.bottom + window.pageYOffset + 5,
          left: rect.left + window.pageXOffset,
          width: rect.width,
        });
      };
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    }
  }, [open]);

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
      {/* 🎯 Tıpkı müşteri seçicindeki gibi butona/input alanına tıklama alanı yapıyoruz */}
      <div
        ref={inputRef}
        onClick={() => {
          setOpen(true);
          setSearch("");
        }}
        className={`w-full bg-gray-900/60 border-2 rounded-xl px-4 py-2 cursor-pointer transition-all flex items-center min-h-[42px] ${
          open
            ? "border-blue-500"
            : selectedMaterial?.archived
              ? "border-red-500/50"
              : "border-gray-800"
        }`}
      >
        {open ? (
          // Arama açıkken kullanıcı buraya yazı yazabilsin diye input'u gösteriyoruz
          <input
            type="text"
            autoComplete="off"
            value={search}
            autoFocus
            placeholder={placeholder}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none placeholder-gray-500 text-sm"
          />
        ) : (
          <span
            className={`text-sm ${selectedMaterial ? "text-white animate-in fade-in duration-200" : "text-gray-500"}`}
          >
            {selectedMaterial ? (
              <div className="flex items-center gap-2">
                <span>
                  {selectedMaterial.code ? `${selectedMaterial.code} - ` : ""}
                  {selectedMaterial.comment || ""}
                </span>
                {selectedMaterial.archived && (
                  <span className="text-xs text-red-400 font-normal ml-2 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-900/40 animate-pulse">
                    (Arşivli)
                  </span>
                )}
              </div>
            ) : (
              "Malzeme Ara..."
            )}
          </span>
        )}
      </div>

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
