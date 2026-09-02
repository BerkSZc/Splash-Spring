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
  onSendMail,
  onSendBulkMail,
  selectedCount = 1,
}) {
  useEffect(() => {
    const handleAction = () => {
      onClose();
    };

    window.addEventListener("wheel", handleAction, { passive: true });
    window.addEventListener("scroll", handleAction, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleAction);
      window.removeEventListener("scroll", handleAction);
    };
  }, [onClose]);

  if (!contextMenu) return null;

  const isMultiple = selectedCount > 1;

  return createPortal(
    <div
      className="fixed bg-[#0f172a] border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-56 z-[10000] overflow-hidden backdrop-blur-xl context-menu-container p-1.5"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      {isMultiple ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSendBulkMail();
            onClose();
          }}
          className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 font-semibold rounded-xl flex items-center gap-2.5 transition text-sm"
        >
          <span>✉️</span>
          <span>Toplu Mail Gönder ({selectedCount})</span>
        </button>
      ) : (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(invoice);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-500/20 text-blue-400 rounded-xl flex items-center gap-2.5 transition text-sm"
          >
            <span>✏️</span> Düzenle
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint(invoice);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-white rounded-xl flex items-center gap-2.5 transition text-sm border-t border-gray-800/50"
          >
            <span>🖨️</span> Yazdır
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(invoice);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center gap-2.5 transition text-sm border-t border-gray-800/50"
          >
            <span>👁️</span> İncele
          </button>

          <button
            onClick={(e) => {
              console.log(
                "👉 [1. CONTEXT MENU]: Mail Gönder tıklandı. Giden fatura:",
                invoice,
              );
              e.preventDefault();
              e.stopPropagation();
              onSendMail(invoice);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-600/20 text-blue-300 rounded-xl flex items-center gap-2.5 transition text-sm border-t border-gray-800/50"
          >
            <span>✉️</span> Mail Gönder
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(invoice);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 transition text-sm border-t border-gray-800/50"
          >
            <span>🗑️</span> Sil
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
