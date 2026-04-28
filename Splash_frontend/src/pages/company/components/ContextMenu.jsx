export const ContextMenu = ({ onEdit }) => (
  <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-all"
    >
      <span>✏️</span> Şirketi Düzenle
    </button>
  </div>
);
