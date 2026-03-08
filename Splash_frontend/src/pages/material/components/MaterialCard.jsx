export const MaterialCard = ({
  item,
  onDelete,
  menuItemId,
  setMenuItemId,
  confirmOpen,
  setConfirmOpen,
  onContextMenu,
  deleteConfirmId,
  setDeleteConfirmId,
  selectionMode,
  selectedIds,
  toggleSelectId,
}) => {
  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "₺";
    }
  };

  return (
    <>
      <div
        onContextMenu={(e) => onContextMenu(e, item)}
        onClick={() => {
          if (selectionMode) {
            toggleSelectId(item.id);
          } else {
            setMenuItemId(menuItemId === item.id ? null : item.id);
          }
        }}
        className={`material-card group p-6 rounded-3xl flex justify-between items-center transition-all duration-300 cursor-context-menu ${
          selectionMode && selectedIds.includes(item.id)
            ? "bg-blue-500/20 border border-blue-500"
            : menuItemId === item.id
              ? "bg-blue-500/5 border border-blue-500/50"
              : "bg-gray-900/40 border border-gray-800 hover:border-blue-500/50"
        }`}
      >
        {" "}
        <div className="space-y-3 flex-1">
          <div>
            <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              {item?.code || ""}
            </p>
            <p className="text-sm text-gray-400 line-clamp-1">
              {item?.comment || ""}
            </p>
          </div>

          {/* Fiyat Bilgileri Alanı */}
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                Alış
              </span>
              <span className="text-sm font-semibold text-blue-400">
                {Number(item?.purchasePrice || 0).toFixed(2)}{" "}
                {getCurrencySymbol(item?.purchaseCurrency)}
              </span>
            </div>
            <div className="w-px h-6 bg-gray-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                Satış
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                {Number(item?.salesPrice || 0).toFixed(2)}{" "}
                {getCurrencySymbol(item?.salesCurrency)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg text-xs font-mono font-bold tracking-wider">
            {item?.unit || ""}
          </span>

          <div className="relative">
            <input
              type="checkbox"
              checked={
                selectionMode
                  ? selectedIds.includes(item.id)
                  : menuItemId === item.id
              }
              onChange={() => {
                if (selectionMode) {
                  toggleSelectId(item.id);
                } else {
                  setMenuItemId(menuItemId === item.id ? null : item.id);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded-lg border-2 border-gray-700 bg-gray-800 accent-blue-500 cursor-pointer transition-all hover:border-blue-500 focus:ring-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      {confirmOpen && deleteConfirmId === item.id && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[110] backdrop-blur-md">
          <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[420px] shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Malzemeyi Sil
            </h2>
            <p className="mb-8 text-gray-400">
              <b>{item?.code}</b> kodlu malzeme kalıcı olarak silinecektir. Emin
              misiniz?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
                  setConfirmOpen(false);
                  setMenuItemId(null);
                }}
                className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
