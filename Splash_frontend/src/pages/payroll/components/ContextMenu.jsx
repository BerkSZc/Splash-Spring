export default function ContextMenu({
  deleteTarget,
  setDeleteTarget,
  payrollType,
  confirmDelete,
  contextMenu,
  handleEditClick,
  setContextMenu,
  openDeleteModel,
}) {
  return (
    <>
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[110] backdrop-blur-md">
          <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Faturayı Sil</h2>
            <p className="mb-8 text-gray-400">
              <b>{deleteTarget.fileNo}</b> numaralı {payrollType} kalıcı olarak
              silinecektir. Emin misiniz?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
      {contextMenu && (
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
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-blue-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold"
            >
              <span>✏️</span> Düzenle
            </button>
            <button
              onClick={() => {
                openDeleteModel(contextMenu.item);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 flex items-center gap-3 rounded-xl transition-colors text-sm font-bold border-t border-gray-800/50 mt-1"
            >
              <span>🗑️</span> Sil
            </button>
          </div>
        </div>
      )}
    </>
  );
}
