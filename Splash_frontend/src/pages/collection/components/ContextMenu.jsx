export default function ContextMenu({
  contextMenu,
  onEdit,
  onDelete,
  onClose,
}) {
  if (!contextMenu) return null; // ✅ erken return

  return (
    <div
      className="fixed bg-[#0f172a]/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-48 z-[9999] overflow-hidden animate-in fade-in zoom-in duration-150 context-menu-container"
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
      }}
    >
      <div className="p-1">
        <button
          onClick={() => {
            onEdit(contextMenu.item);
            onClose();
          }}
          className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
        >
          <span>✏️</span> Düzenle
        </button>
        <button
          onClick={() => {
            onDelete(contextMenu.item);
            onClose();
          }}
          className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
        >
          <span>🗑️</span> Sil
        </button>
      </div>
    </div>
  );
}
