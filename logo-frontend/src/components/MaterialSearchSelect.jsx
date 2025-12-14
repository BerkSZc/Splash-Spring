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

  const selectedMaterial = materials.find(
    (m) => String(m.id) === String(value)
  );

  const filtered = materials.filter(
    (m) =>
      m.code?.toLowerCase().includes(search.toLowerCase()) ||
      m.comment?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open, search]);

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={
          open
            ? search
            : selectedMaterial
            ? `${selectedMaterial.code} – ${selectedMaterial.comment}`
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
        className="w-full border p-2 rounded-lg"
      />

      {open &&
        pos &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 9999,
            }}
            className="max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg"
          >
            {filtered.length === 0 && (
              <div className="p-2 text-sm text-gray-500">Sonuç bulunamadı</div>
            )}

            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className="cursor-pointer p-2 hover:bg-blue-100 text-sm"
              >
                <span className="font-medium">{m.code}</span> – {m.comment}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
