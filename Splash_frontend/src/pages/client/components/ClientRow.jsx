export default function ClientRow({
  customer = {},
  isSelected,
  onCheckboxChange,
  onContextMenu,
}) {
  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, customer)}
      onClick={() => onCheckboxChange(customer.id)}
      className={`client-row group transition-all cursor-pointer ${
        isSelected
          ? "bg-blue-500/20 border-l-4 border-blue-500"
          : "hover:bg-blue-500/5"
      }`}
    >
      <td
        className="p-5 text-center w-16 select-none"
        onClick={(e) => {
          e.stopPropagation();
          onCheckboxChange(customer.id);
        }}
      >
        <div
          className={`w-5 h-5 rounded border-2 mx-auto flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "border-gray-600 bg-gray-800 hover:border-gray-500"
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </td>
      <td className="p-5">
        <div className="font-bold text-white text-lg">
          {customer?.name || ""}
        </div>
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
          {customer?.local || ""} / {customer?.district || ""}
        </div>
        <div className="text-[10px] text-blue-500 uppercase font-bold mt-1 tracking-widest">
          {customer?.country || ""}
        </div>
        <div className="text-[10px] text-white-500 uppercase font-bold mt-1 tracking-widest">
          {customer?.code || ""}
        </div>
      </td>
      <td className="p-5 text-right font-mono">
        <span
          className={`text-lg font-bold whitespace-nowrap ${
            (Number(customer?.finalBalance) || 0) < 0
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {(Number(customer?.finalBalance) || 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
          })}{" "}
          ₺
        </span>
      </td>
    </tr>
  );
}
