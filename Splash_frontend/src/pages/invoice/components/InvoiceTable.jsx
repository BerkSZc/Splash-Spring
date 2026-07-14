import ContextMenu from "./ContextMenu";

export default function InvoiceTable({
  invoices,
  onEdit,
  onDelete,
  onView,
  onPrint,
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
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                E-Fatura
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                Toplam Tutar
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
                  className={`invoice-row transition-all cursor-pointer ${
                    selectedInvoiceId === inv.id
                      ? "bg-blue-500/20 border-l-4 border-blue-500"
                      : "hover:bg-blue-500/5"
                  }`}
                >
                  <td className="p-5 font-mono text-blue-400 font-bold">
                    {inv?.fileNo}
                  </td>

                  <td
                    className="p-5 text-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInvoice(inv.id);
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 mx-auto flex items-center justify-center transition-all ${
                        selectedInvoiceId === inv.id
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    >
                      {selectedInvoiceId === inv.id && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </td>

                  <td className="p-5 text-gray-300 font-mono text-sm">
                    {formatDateToTR(inv?.date) || ""}
                  </td>
                  <td className="p-5 font-bold text-white">
                    {inv.customer?.name || ""}
                  </td>

                  <td className="p-5 text-left">
                    {inv.invoiced === true ||
                    inv.invoiced === undefined ||
                    inv.invoiced === null ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] ">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Kesildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] ">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Kesilmedi
                      </span>
                    )}
                  </td>

                  <td className="p-5 text-right font-mono text-lg font-bold text-emerald-400">
                    {(Number(inv.totalPrice) || 0)?.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
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
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          invoice={contextMenu.invoice}
          contextMenu={contextMenu}
          onClose={() => setContextMenu(null)}
          onEdit={onEdit}
          onPrint={onPrint}
          onDelete={onDelete}
          onView={onView}
          onSelectInvoice={onSelectInvoice}
        />
      )}
    </div>
  );
}
