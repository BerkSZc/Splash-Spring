export const CompanyCard = ({ company, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(company.schemaName)}
    className={`group cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 ${
      isSelected
        ? "border-blue-500 bg-blue-500/5 shadow-[0_0_25px_rgba(59,130,246,0.15)]"
        : "border-gray-800 bg-gray-900/40 hover:border-gray-600"
    }`}
  >
    <div className="flex justify-between items-center mb-6">
      <div
        className={`p-4 rounded-2xl ${
          isSelected ? "bg-blue-600" : "bg-gray-800"
        }`}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      {isSelected && (
        <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
      )}
    </div>
    <h4 className="text-2xl font-bold text-white mb-2">{company.name}</h4>
    <p className="text-gray-400 text-sm">
      {company.description || company.desc}
    </p>
    <p className="text-xs text-blue-500 mt-2 font-mono">
      Şema: {company.schemaName}
    </p>
  </div>
);
