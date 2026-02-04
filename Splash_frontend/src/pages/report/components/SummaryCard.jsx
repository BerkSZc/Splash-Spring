export const SummaryCard = ({ title, value, color }) => (
  <div
    className={`p-6 rounded-3xl border bg-gray-800/20 ${
      color === "emerald"
        ? "border-emerald-500/20"
        : color === "orange"
          ? "border-orange-500/20"
          : "border-blue-500/20"
    }`}
  >
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
      {title}
    </p>
    <p className="text-2xl font-black text-white">
      ₺ {value?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
    </p>
  </div>
);
