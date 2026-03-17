import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ContextMenu({
  x,
  y,
  invoice,
  contextMenu,
  onClose,
  onEdit,
  onPrint,
  onDelete,
  onView,
  onSelectInvoice,
}) {
  useEffect(() => {
    const handleAction = () => {
      onClose();
      onSelectInvoice(null);
    };

    window.addEventListener("wheel", handleAction, { passive: true });
    window.addEventListener("scroll", handleAction, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleAction);
      window.removeEventListener("scroll", handleAction);
    };
  }, [onClose, onSelectInvoice]);

  if (!contextMenu) return null;

  return createPortal(
    <div
      className="fixed bg-[#0f172a] border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-44 z-[10000] overflow-hidden backdrop-blur-xl context-menu-container"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <button
        onClick={() => {
          onEdit(invoice);
          onClose();
        }}
        className="w-full text-left px-4 py-3 hover:bg-blue-500/20 text-blue-400 flex items-center gap-2"
      >
        ✏️ Düzenle
      </button>

      <button
        onClick={() => {
          onPrint(invoice);
          onClose();
        }}
        className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-2 border-t border-gray-800"
      >
        🖨️ Yazdır
      </button>

      <button
        onClick={() => {
          onDelete(invoice);
          onClose();
        }}
        className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 flex items-center gap-2 border-t border-gray-800"
      >
        🗑️ Sil
      </button>

      <button
        onClick={() => {
          onView(invoice);
          onClose();
        }}
        className="w-full text-left px-4 py-3 hover:bg-yellow-500/20 text-yellow-400 flex items-center gap-2 border-t border-gray-800"
      >
        👁️ İncele
      </button>
    </div>,
    document.body,
  );
}
