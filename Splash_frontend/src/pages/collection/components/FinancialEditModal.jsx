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
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-md px-4">
      <form
        onSubmit={onSave}
        className="bg-[#0f172a] border border-gray-800 p-10 rounded-[3rem] w-full max-w-[550px] shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-white flex items-center gap-3">
          <span className="p-2 bg-blue-600 rounded-xl text-xl">📝</span>
          İşlemi Güncelle
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
                Tarih
              </label>
              <input
                required
                type="date"
                value={editForm?.date || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
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
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Müşteri / Firma
            </label>
            <CustomerSearchSelect
              customers={customers}
              value={editForm?.customerId || ""}
              onChange={(id) => setEditForm({ ...editForm, customerId: id })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Açıklama
            </label>
            <textarea
              rows="3"
              value={editForm?.comment || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, comment: e.target.value })
              }
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition resize-none"
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">
              İşlem No
            </label>
            <input
              required
              rows="3"
              value={editForm?.fileNo || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, fileNo: e.target.value })
              }
              className="w-full uppercase bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition resize-none"
            ></input>
          </div>
        </div>
        <div className="flex gap-4 mt-10 font-bold">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-2xl hover:bg-gray-700 transition"
          >
            İptal
          </button>
          <button
            type="submit"
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
