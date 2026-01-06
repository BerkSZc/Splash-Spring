export const ImportButton = ({
  onClick,
  disabled,
  icon,
  label,
  variant = "blue",
}) => {
  const variants = {
    blue: "bg-blue-600/10 hover:bg-blue-600 border-blue-600/20 text-blue-400",
    emerald:
      "bg-emerald-600/10 hover:bg-emerald-600 border-emerald-600/20 text-emerald-400",
    purple:
      "bg-purple-600/10 hover:bg-purple-600 border-purple-600/20 text-purple-400",
    orange:
      "bg-orange-600/10 hover:bg-orange-600 border-orange-600/20 text-orange-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full flex items-center justify-between border p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 hover:text-white ${variants[variant]}`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`p-2 rounded-lg group-hover:bg-white/20 transition-colors ${
            variant === "blue"
              ? "bg-blue-600/20"
              : variant === "emerald"
              ? "bg-emerald-600/20"
              : variant === "purple"
              ? "bg-purple-600/20"
              : "bg-orange-600/20"
          }`}
        >
          {icon}
        </span>
        <span className="font-bold uppercase tracking-wider text-sm text-left leading-tight">
          {disabled ? "Yükleniyor..." : label}
        </span>
      </div>
      <svg
        className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};
