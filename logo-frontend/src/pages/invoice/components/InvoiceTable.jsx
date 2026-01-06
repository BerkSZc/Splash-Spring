export default function InvoiceTable({
  invoices,
  openMenuId,
  onToggleMenu,
  onEdit,
  onDelete,
  onPrint,
  menuRef,
  year,
}) {
  const formatDateToTR = (dateString) => {
    if (
      !dateString ||
      typeof dateString !== "string" ||
      dateString.includes(".")
    )
      return dateString;
    const [y, m, d] = dateString.split("-");
    return `${d}.${m}.${y}`;
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Fatura No
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Tarih
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Müşteri / Firma
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                Toplam Tutar
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-24">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-blue-500/5 transition-all group"
                >
                  <td className="p-5 font-mono text-blue-400 font-bold">
                    {inv.fileNo}
                  </td>
                  <td className="p-5 text-gray-300 font-mono text-sm">
                    {formatDateToTR(inv.date)}
                  </td>
                  <td className="p-5 font-bold text-white">
                    {inv.customer?.name}
                  </td>
                  <td className="p-5 text-right font-mono text-lg font-bold text-emerald-400">
                    ₺{" "}
                    {inv.totalPrice?.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-5 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMenu(inv.id);
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-all"
                    >
                      ⋮
                    </button>
                    {openMenuId === inv.id && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-12 top-0 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-36 z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
                      >
                        <button
                          onClick={() => {
                            onEdit(inv);
                            onToggleMenu(null);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-500/10 text-sm text-blue-400 flex items-center gap-2"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => {
                            onToggleMenu(null);
                            onDelete(inv);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 border-t border-gray-800 flex items-center gap-2"
                        >
                          🗑️ Sil
                        </button>
                        <button
                          onClick={() => {
                            onToggleMenu(null);
                            onPrint(inv);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-sm text-white-400 border-t border-gray-800 flex items-center gap-2"
                        >
                          🖨️ Yazdır
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-20 text-center text-gray-600 italic"
                >
                  {year} yılına ait kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
