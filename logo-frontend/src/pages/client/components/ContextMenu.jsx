export default function ContextMenu({
  contextMenu,
  selectedCount,
  isAllArchived,
  onClose,
  onEdit,
  onArchiveClick,
}) {
  if (!contextMenu) return null;

  return (
    <div className="fixed inset-0 z-[150]" onClick={onClose}>
      <div
        style={{ top: contextMenu.y, left: contextMenu.x }}
        className="absolute bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl w-56 overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Eğer sadece 1 kişi seçiliyse Düzenle seçeneğini göster */}
        {selectedCount === 1 && (
          <button
            onClick={() => onEdit(contextMenu.customer)}
            className="block w-full text-left px-4 py-3 hover:bg-blue-600 text-sm text-white"
          >
            Düzenle
          </button>
        )}

        {/* Arşivleme / Arşivden Çıkarma butonu */}
        <button
          onClick={onArchiveClick}
          className="block w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-orange-400 border-t border-gray-800"
        >
          {isAllArchived ? "Seçilenleri Arşivden Çıkar" : "Seçilenleri Arşivle"}
        </button>
      </div>
    </div>
  );
}
