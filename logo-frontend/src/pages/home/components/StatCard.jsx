export default function StatCard({
  icon,
  label,
  title,
  value,
  unit,
  colorClass,
  hoverClass,
}) {
  return (
    <div
      className={`group bg-gray-900/40 border border-gray-800 p-8 rounded-[2rem] ${hoverClass} transition-all duration-300 shadow-xl`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${colorClass} rounded-2xl`}>{icon}</div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <h2 className="text-gray-400 font-medium">{title}</h2>
      <p className="text-4xl font-black text-white mt-1 group-hover:text-inherit transition-colors tracking-tight">
        {value}{" "}
        <span className="text-lg font-normal text-gray-600">{unit}</span>
      </p>
    </div>
  );
}
