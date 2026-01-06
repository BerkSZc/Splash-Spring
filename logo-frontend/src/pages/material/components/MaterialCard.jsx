export const MaterialCard = ({ item, onEdit }) => (
  <div className="group p-6 bg-gray-900/40 border border-gray-800 rounded-3xl flex justify-between items-center hover:border-gray-600 transition-all duration-300">
    <div className="space-y-1">
      <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
        {item.code}
      </p>
      <p className="text-sm text-gray-400 line-clamp-1">{item.comment}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="px-3 py-1 bg-gray-800 text-blue-400 rounded-lg text-xs font-mono font-bold tracking-wider">
        {item.unit}
      </span>
      <button
        onClick={() => onEdit(item)}
        className="p-2.5 bg-gray-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-xl transition-all"
        title="Düzenle"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </div>
  </div>
);
