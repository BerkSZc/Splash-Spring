export const ReportTable = ({ title, items, color }) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <h3
      className={`text-sm font-bold uppercase tracking-widest ${color === "emerald" ? "text-emerald-400" : "text-orange-400"}`}
    >
      {title} Detay Listesi
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">
            <th className="px-6 py-4">Ay</th>
            <th className="px-6 py-4">Matrah (KDV'siz)</th>
            <th className="px-6 py-4">KDV Toplam</th>
            <th className="px-6 py-4 text-right">Net Tutar (KDV Dahil)</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(items) &&
            items.map((item, index) => (
              <tr
                key={index}
                className="bg-gray-800/40 hover:bg-gray-800/60 transition-all"
              >
                <td className="px-6 py-4 rounded-l-2xl font-bold">
                  {item.month} / {item.year}
                </td>
                <td className="px-6 py-4 font-mono text-sm">
                  ₺{" "}
                  {item.totalAmount?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 font-mono text-sm">
                  ₺{" "}
                  {item.totalKdv?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 text-right rounded-r-2xl font-black text-blue-400 font-mono">
                  ₺{" "}
                  {item.netTotal?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
);
