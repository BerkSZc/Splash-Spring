export default function FinancialTable({
  filteredList,
  type,
  selectedId,
  onSelectRow,
  onContextMenu,
  formatDate,
  setSearch,
  setSortOrder,
  search,
  sortOrder,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          İşlem Geçmişi
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Listede ara..."
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-gray-900 border-2 border-gray-800 text-gray-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-800"
          >
            <option className="bg-gray-900" value="desc">
              🗓️ En Yeni
            </option>
            <option className="bg-gray-900" value="asc">
              🗓️ En Eski
            </option>
          </select>
        </div>
      </div>
      <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/30 text-gray-500 border-b border-gray-800">
                <th className="p-5 text-xs font-bold uppercase tracking-widest">
                  Tarih
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-center w-16">
                  Seç
                </th>
                <th className="p-1 text-xs font-medium uppercase tracking-widest">
                  İşlem No
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest">
                  Müşteri / Firma
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest">
                  Açıklama
                </th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {Array.isArray(filteredList) && filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectRow(item.id)}
                    onContextMenu={(e) => onContextMenu(e, item)}
                    className={`financial-row transition-all cursor-pointer ${
                      selectedId === item.id
                        ? "bg-blue-500/20 border-l-4 border-blue-500"
                        : "hover:bg-blue-500/5"
                    }`}
                  >
                    <td className="p-5 text-gray-300 font-mono text-sm">
                      {formatDate(item?.date) || ""}
                    </td>
                    <td
                      className="p-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedId === item.id}
                        onChange={() => onSelectRow(item.id)}
                        className="w-5 h-5 accent-blue-500 rounded-lg cursor-pointer"
                      />
                    </td>
                    <td className="p-5 font-bold text-white max-w-[300px] truncate">
                      {item?.fileNo || ""}
                    </td>
                    <td className="p-5 font-bold text-white max-w-[300px] truncate">
                      {item.customer?.name || ""}
                    </td>
                    <td className="p-5 text-gray-400 text-sm max-w-[250px] truncate">
                      {item.comment || "-"}
                    </td>
                    <td className="p-5 text-right">
                      <span
                        className={`text-lg font-bold font-mono ${
                          type === "received"
                            ? "text-emerald-400"
                            : "text-orange-400"
                        }`}
                      >
                        {(Number(item.price) || 0).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center text-gray-600 italic"
                  >
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
