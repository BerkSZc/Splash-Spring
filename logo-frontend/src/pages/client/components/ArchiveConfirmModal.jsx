export default function ArchiveConfirmModal({
  isOpen,
  count,
  action,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[200] backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] w-[400px] shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Emin misiniz?</h3>
        <p className="text-gray-400 mb-8">
          <strong>{count}</strong> müşteri{" "}
          {action === "archive" ? "arşivlenecek." : "arşivden çıkarılacak."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl font-bold"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500"
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
