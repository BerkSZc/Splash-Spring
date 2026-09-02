import { useState, useRef, useEffect } from "react";

export default function EndorsedCustomerSelect({
  customers,
  value,
  onChange,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter(
    (c) => {
      if (!value) return !c.archived;
      const search = value.toLocaleLowerCase("tr-TR").trim();
      return (
        !c.archived &&
        ((c?.name || "").toLocaleLowerCase("tr-TR").includes(search) ||
          (c?.code || "").toLocaleLowerCase("tr-TR").includes(search))
      );
    },
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Müşteri seçin veya elle yazın..."
          value={value || ""}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition uppercase"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onChange(c.name);
                  setIsOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex justify-between items-center transition"
              >
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {c.code}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500 text-xs italic">
              Kayıtlı cari bulunamadı. Yazılan isim doğrudan kaydedilecek.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
