import { useVoucher } from "../../../../backend/store/useVoucher";

export default function ClientRow({
  customer,
  isSelected,
  onCheckboxChange,
  onContextMenu,
  isOpen,
  onToggleMenu,
  onEdit,
  onOpenStatement,
  onArchiveToggle,
}) {
  const { vouchers } = useVoucher();
  const myVoucher = vouchers?.find((v) => v?.customer?.id === customer?.id);
  return (
    <tr
      key={customer.id}
      onContextMenu={(e) => onContextMenu(e, customer)}
      onClick={() => onCheckboxChange(customer.id)}
      className={`group transition-all ${
        customer.archived
          ? "opacity-40 grayscale bg-gray-950"
          : "hover:bg-blue-500/5"
      }`}
    >
      <td className="p-5 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onCheckboxChange(customer.id)}
          className="w-5 h-5 rounded-lg accent-blue-500 bg-gray-800 border-gray-700"
        />
      </td>
      <td className="p-5">
        <div className="font-bold text-white text-lg">{customer.name}</div>
        <div className="flex items-center gap-2">
          {customer.vdNo ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider">
              VN: {customer.vdNo}
            </span>
          ) : (
            <span className="text-[10px] text-gray-600 italic">
              Vergi No Girilmemiş
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {customer.address || "Adres yok"}
        </div>
      </td>
      <td className="p-5">
        <div className="text-gray-300 text-sm">
          {customer.local} / {customer.district}
        </div>
        <div className="text-[10px] text-blue-500 uppercase font-bold mt-1 tracking-widest">
          {customer.country}
        </div>
      </td>
      <td className="p-5 text-right font-mono">
        <span
          className={`text-lg font-bold ${
            Number(myVoucher?.finalBalance ?? 0) < 0
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          ₺{" "}
          {Number(myVoucher?.finalBalance ?? 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
          })}
        </span>
      </td>
      <td className="p-5 text-center relative action-menu-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(customer.id);
          }}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-full top-0 mr-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-48 z-[100] overflow-hidden backdrop-blur-xl">
            {!customer.archived && (
              <button
                onClick={() => onEdit(customer)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-gray-300"
              >
                Düzenle
              </button>
            )}
            <button
              onClick={() => onOpenStatement(customer)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 border-t border-gray-800"
            >
              📊 Hesap Ekstresi
            </button>
            <button
              onClick={() => onArchiveToggle(customer)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 text-sm text-orange-400 border-t border-gray-800"
            >
              {customer.archived ? "Arşivden Çıkar" : "Arşivle"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
