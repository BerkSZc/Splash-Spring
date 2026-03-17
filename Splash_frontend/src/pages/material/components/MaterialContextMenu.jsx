import { useEffect } from "react";

export const MaterialContextMenu = ({
  contextMenu,
  onEdit,
  onClose,
  setMenuItemId,
  setConfirmOpen,
  setDeleteConfirmId,
  setArchiveAction,
  setArchiveTargetId,
  setArchiveConfirmOpen,
  selectionMode,
  showArchived,
  onSelectMaterial,
  onView,
}) => {
  useEffect(() => {
    const handleAction = () => {
      onClose();
      onSelectMaterial(null);
    };
    window.addEventListener("wheel", handleAction, { passive: true });
    window.addEventListener("scroll", handleAction, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleAction);
      window.removeEventListener("scroll", handleAction);
    };
  }, [onClose, onSelectMaterial]);

  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-[#0f172a]/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-48 z-[9999] overflow-hidden animate-in fade-in zoom-in duration-150 context-menu-container"
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
      }}
    >
      <div className="p-1">
        {selectionMode ? (
          <button
            onClick={() => {
              setArchiveAction(showArchived ? "unarchive" : "archive");
              setArchiveConfirmOpen(true);
              onClose();
            }}
            className="w-full text-left px-4 py-3 hover:bg-amber-600/20 text-amber-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
          >
            <span>📦</span>{" "}
            {contextMenu.item.archived
              ? "Seçilenleri Arşivden Çıkart"
              : "Seçilenleri Arşivle"}
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                onEdit(contextMenu.item);
                setMenuItemId(null);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
            >
              <span>✏️</span> Düzenle
            </button>
            <button
              onClick={() => {
                setDeleteConfirmId(contextMenu.item.id);
                setConfirmOpen(true);
                setMenuItemId(null);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>🗑️</span> Sil
            </button>
            <button
              onClick={() => {
                setArchiveAction(
                  contextMenu.item.archived ? "unarchive" : "archive",
                );
                setArchiveTargetId(contextMenu.item.id);
                setArchiveConfirmOpen(true);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-amber-600/20 text-amber-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>📦</span>{" "}
              {contextMenu.item.archived ? "Arşivden Çıkar" : "Arşivle"}
            </button>
            <button
              onClick={() => {
                onView(contextMenu.item);
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
};
