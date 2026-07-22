import CustomerSearchSelect from "../../../components/CustomerSearchSelect";

export default function FinancialEditModal({
  editing,
  editForm,
  setEditForm,
  onCancel,
  onSave,
  customers,
}) {
  if (!editing) return null;

  return (
    <div className="fixed modal-container inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <form
        onSubmit={onSave}
        className="bg-[#0f172a] border border-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-[550px] max-h-[90vh] flex flex-col shadow-2xl relative"
      >
        {/* 1. BAŞLIK (Sabit Header) */}
        <div className="flex-none mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-xl text-xl">
              📝
            </span>
            İşlemi Güncelle
          </h2>
        </div>

        {/* 2. FORM İÇERİĞİ (Scroll Edilebilir Gövde) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                Tarih
              </label>
              <input
                required
                type="date"
                value={editForm?.date || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                Tutar (₺)
              </label>
              <input
                required
                type="text"
                value={editForm?.price || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const cleaned = raw.replace(/[^0-9,]/g, "");
                  const parts = cleaned.split(",");
                  const intPart = parts[0].replace(/[^0-9]/g, "");
                  const decPart =
                    parts.length > 1
                      ? parts[1].replace(/[^0-9]/g, "").slice(0, 2)
                      : null;

                  if (!intPart && decPart === null) {
                    setEditForm({ ...editForm, price: "" });
                    return;
                  }

                  const formattedInt = Number(intPart || 0).toLocaleString(
                    "tr-TR",
                  );
                  const formatted =
                    decPart !== null
                      ? `${formattedInt},${decPart}`
                      : formattedInt;
                  setEditForm({ ...editForm, price: formatted });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
              İşlem Tipi
            </label>
            <select
              value={editForm?.type || "PAYMENT"}
              onChange={(e) =>
                setEditForm({ ...editForm, type: e.target.value })
              }
              className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition cursor-pointer text-sm"
            >
              <option value="RECEIVED">Tahsilat</option>
              <option value="PAYMENT">Ödeme</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
              Müşteri / Firma
            </label>
            <CustomerSearchSelect
              customers={customers}
              value={editForm?.customerId || ""}
              onChange={(id) => setEditForm({ ...editForm, customerId: id })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
              Açıklama
            </label>
            <textarea
              rows="2"
              value={editForm?.comment || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, comment: e.target.value })
              }
              className="w-full bg-gray-800/80 border border-gray-700/80 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition resize-none text-sm"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
              İşlem No
            </label>
            <input
              required
              value={editForm?.fileNo || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, fileNo: e.target.value })
              }
              className="w-full uppercase bg-gray-800/80 border border-gray-700/80 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition text-sm"
            />
          </div>
        </div>

        {/* 3. BUTONLAR (Sabit Footer) */}
        <div className="flex-none flex gap-3 mt-6 pt-4 border-t border-gray-800/80 font-bold">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700/80 transition text-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition text-sm"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
