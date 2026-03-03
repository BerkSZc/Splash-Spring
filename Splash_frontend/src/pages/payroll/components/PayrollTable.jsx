export default function PayrollTable({
  filteredList,
  currentTheme,
  search,
  setSearch,
  onEdit,
  onDelete,
  formatDate,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="p-7 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <span
            className={`p-2 rounded-xl ${currentTheme.bg} bg-opacity-20 ${currentTheme.color}`}
          >
            {currentTheme.icon}
          </span>
          {currentTheme.label} Geçmişi
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-2xl pl-4 pr-10 py-2 outline-none focus:border-blue-500 transition cursor-pointer ring-0 focus:ring-0"
            >
              <option className="bg-gray-900" value="desc">
                🗓️ En Yeni
              </option>
              <option className="bg-gray-900" value="asc">
                🗓️ En Eski
              </option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Müşteri, banka veya no ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl pl-11 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-full sm:w-80 transition"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">
              <th className="p-6">İşlem Tarihi</th>
              <th className="p-6">Vade Tarihi</th>
              <th className="p-6">Müşteri / Cari</th>
              <th className="p-6">Evrak Detayı</th>
              <th className="p-6 text-right">Tutar</th>
              <th className="p-6 text-center w-32">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {(Array.isArray(filteredList) ? filteredList : []).map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-500/5 transition-all group"
              >
                <td className="p-6 text-gray-400 font-mono text-sm">
                  {formatDate(item?.transactionDate) || ""}
                </td>
                <td className="p-6">
                  <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-bold font-mono">
                    {formatDate(item?.expiredDate) || ""}
                  </span>
                </td>
                <td className="p-6">
                  <div className="font-bold text-white text-base">
                    {item.customer?.name || ""}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">
                    Cari ID: #{item.customer?.id || ""}
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-white text-sm font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    {item.bankName || "Banka Yok"}
                  </div>
                  <div className="text-gray-500 text-xs mt-1 ml-3.5 italic">
                    {item.bankBranch || "Şube Belirtilmemiş"} —{" "}
                    <span className="text-gray-400 font-mono">
                      {item?.fileNo || ""}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <p className="text-white font-black font-mono text-lg">
                    ₺{" "}
                    {(Number(item.amount) || "").toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2.5 bg-gray-800 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all shadow-lg border border-gray-700"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-red-500 rounded-xl transition-all shadow-lg border border-gray-700"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && (
          <div className="py-20 text-center text-gray-600 italic">
            Bu kriterlere uygun kayıt bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
