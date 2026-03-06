import { createPortal } from "react-dom";

export default function InvoiceTable({
  invoices,
  openMenuId,
  onToggleMenu,
  onEdit,
  onDelete,
  onPrint,
  menuRef,
  year,
  formatDateToTR,
  isLoading,
  selectedInvoiceId,
  onSelectInvoice,
  onContextMenu,
  contextMenu,
  setContextMenu,
}) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-visible backdrop-blur-sm shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Fatura No
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-16">
                Seç
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
            {(Array.isArray(invoices) ? invoices?.length : []) > 0 ? (
              (Array.isArray(invoices) ? invoices : []).map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv.id)}
                  onContextMenu={(e) => onContextMenu(e, inv)}
                  className={`transition-all cursor-pointer ${
                    selectedInvoiceId === inv.id
                      ? "bg-blue-500/20 border-l-4 border-blue-500"
                      : "hover:bg-blue-500/5"
                  }`}
                >
                  <td className="p-5 font-mono text-blue-400 font-bold">
                    {inv?.fileNo}
                  </td>

                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceId === inv.id}
                      onChange={() => onSelectInvoice(inv.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 accent-blue-500 rounded-lg cursor-pointer"
                    />
                  </td>

                  <td className="p-5 text-gray-300 font-mono text-sm">
                    {formatDateToTR(inv?.date) || ""}
                  </td>
                  <td className="p-5 font-bold text-white">
                    {inv.customer?.name || ""}
                  </td>
                  <td className="p-5 text-right font-mono text-lg font-bold text-emerald-400">
                    ₺{" "}
                    {(Number(inv.totalPrice) || 0)?.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
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
                  {isLoading
                    ? "Veriler çekiliyor..."
                    : `${year || ""} yılına ait kayıt bulunamadı.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {contextMenu &&
        createPortal(
          <div
            className="fixed bg-[#0f172a] border border-gray-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-44 z-[9999] overflow-hidden backdrop-blur-xl context-menu-container"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
          >
            <button
              onClick={() => {
                onEdit(contextMenu.invoice);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-500/20 text-blue-400 flex items-center gap-2"
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={() => {
                onPrint(contextMenu.invoice);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-2 border-t border-gray-800"
            >
              🖨️ Yazdır
            </button>
            <button
              onClick={() => {
                onDelete(contextMenu.invoice);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 flex items-center gap-2 border-t border-gray-800"
            >
              🗑️ Sil
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
