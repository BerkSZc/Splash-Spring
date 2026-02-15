import { SummaryCard } from "./SummaryCard";

export const KDVSummary = ({ data }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Toplam Alım KDV"
        value={Number(data?.totalPurchaseKdv || 0)}
        color="emerald"
      />
      <SummaryCard
        title="Toplam Satış KDV"
        value={Number(data?.totalSalesKdv || 0)}
        color="orange"
      />
      <SummaryCard
        title="Net KDV Durumu"
        value={Number(data?.netKdv || 0)}
        color="blue"
      />
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            <th className="px-6 py-4">Dönem</th>
            <th className="px-6 py-4 text-emerald-400">Alınan KDV (Alım)</th>
            <th className="px-6 py-4 text-orange-400">Ödenen KDV (Satış)</th>
            <th className="px-6 py-4 text-right">Fark / Durum</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(data?.monthlySummary) ? data.monthlySummary : []).map(
            (item, index) => (
              <tr
                key={index}
                className="bg-gray-800/40 hover:bg-gray-800/60 transition-all group"
              >
                <td className="px-6 py-4 rounded-l-2xl font-bold text-sm">
                  {item?.month || ""} / {item?.year || ""}
                </td>
                <td className="px-6 py-4 font-mono text-sm">
                  ₺{" "}
                  {item?.purchaseKdv?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 font-mono text-sm">
                  ₺{" "}
                  {item?.salesKdv?.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={`px-6 py-4 text-right rounded-r-2xl font-bold font-mono text-sm ${item?.diff > 0 ? "text-red-400" : "text-blue-400"}`}
                >
                  {item?.diff > 0
                    ? `+ ₺ ${item.diff.toLocaleString()}`
                    : `- ₺ ${Math.abs(item.diff).toLocaleString()}`}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  </div>
);
