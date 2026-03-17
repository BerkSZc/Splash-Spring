import { useEffect } from "react";

export default function ContextMenu({
  contextMenu,
  isAllArchived,
  selectionMode,
  showArchived,
  onClose,
  onEdit,
  onArchiveClick,
  onOpenStatement,
  onSelectedCustomer,
  onView,
}) {
  useEffect(() => {
    const handleAction = () => {
      onClose();
      if (!selectionMode) {
        onSelectedCustomer([]);
      }
    };

    window.addEventListener("scroll", handleAction, { passive: true });
    window.addEventListener("wheel", handleAction, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleAction);
      window.removeEventListener("wheel", handleAction);
    };
  }, [onClose, onSelectedCustomer]);

  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-[#0f172a]/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-48 z-[9999] overflow-hidden animate-in fade-in zoom-in duration-150 context-menu-container"
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
    >
      <div className="p-1">
        {selectionMode ? (
          <button
            onClick={onArchiveClick}
            className="w-full text-left px-4 py-3 hover:bg-amber-600/20 text-amber-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
          >
            <span>📦</span>{" "}
            {showArchived
              ? "Seçilenleri Arşivden Çıkar"
              : "Seçilenleri Arşivle"}
          </button>
        ) : (
          <>
            {!contextMenu.customer?.archived && (
              <button
                onClick={() => {
                  onEdit(contextMenu.customer);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
              >
                <span>✏️</span> Düzenle
              </button>
            )}
            <button
              onClick={() => {
                onOpenStatement(contextMenu.customer);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-purple-600/20 text-purple-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>📊</span> Hesap Ekstresi
            </button>
            <button
              onClick={onArchiveClick}
              className="w-full text-left px-4 py-3 hover:bg-amber-600/20 text-amber-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>📦</span> {isAllArchived ? "Arşivden Çıkar" : "Arşivle"}
            </button>
            <button
              onClick={() => {
                onView(contextMenu.customer);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>👁️</span> İncele
            </button>
          </>
        )}
      </div>
    </div>
  );
}
