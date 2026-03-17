import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ContextMenu({
  contextMenu,
  handleEditClick,
  openDeleteModel,
  onClose,
  onSelectedPayroll,
  onView,
}) {
  useEffect(() => {
    const handleAction = () => {
      onClose();
      onSelectedPayroll(null);
    };

    window.addEventListener("scroll", handleAction, { passive: true });
    window.addEventListener("wheel", handleAction, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleAction);
      window.removeEventListener("wheel", handleAction);
    };
  }, [onClose, onSelectedPayroll]);

  if (!contextMenu) return null;
  return createPortal(
    <div
      className="fixed bg-[#0f172a]/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-48 z-[9999] overflow-hidden context-menu-container"
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
      }}
    >
      <div className="p-1">
        <button
          onClick={() => {
            handleEditClick(contextMenu.item);
            onClose(null);
          }}
          className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
        >
          <span>✏️</span> Düzenle
        </button>
        <button
          onClick={() => {
            openDeleteModel(contextMenu.item);
            onClose(null);
          }}
          className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
        >
          <span>🗑️</span> Sil
        </button>
        <button
          onClick={() => {
            onView(contextMenu.item);
            onClose(null);
          }}
          className="w-full text-left px-4 py-3 hover:bg-yellow-600/20 text-yellow-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
        >
          <span>👁️</span> İncele
        </button>
      </div>
    </div>,
    document.body,
  );
}
