export default function DeleteConfirmModal({
  deleteTarget,
  onCancel,
  onConfirm,
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-[450px] shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center text-white">
          Kaydı Sil
        </h2>
        <p className="mb-8 text-gray-400 text-center leading-relaxed">
          <b className="text-white">{deleteTarget.customer?.name}</b> için
          oluşturulan{" "}
          <span className="text-red-400 font-mono block text-xl mt-2 font-bold italic">
            {Number(deleteTarget.price).toLocaleString()} ₺
          </span>{" "}
          tutarındaki bu işlem kalıcı olarak silinecektir. Emin misiniz?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700 transition"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-500 shadow-lg shadow-red-600/20 transition"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}
