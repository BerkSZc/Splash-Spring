import { handleReportPrint } from "../utils/ReportPrintHelper";

const BalanceStatusReport = ({
  items = [],
  showArchived,
  setShowArchived,
  setSortDirection,
  sortDirection,
}) => {
  const totals = items.reduce(
    (acc, curr) => {
      const balance = Number(curr?.finalBalance || 0);
      if (balance > 0) {
        acc.debit += balance;
      } else if (balance < 0) {
        acc.credit += Math.abs(balance);
      }
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Borç/Alacak Durum Raporu
        </h3>
        <div className="flex bg-gray-900/40 p-1 rounded-2xl border border-gray-800">
          <button
            onClick={() => setSortDirection("desc")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sortDirection === "desc"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-500 hover:text-gray-300"
            }`}
            title="En çok borcu olandan az olana"
          >
            📈 Borçlu
          </button>
          <button
            onClick={() => setSortDirection("asc")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sortDirection === "asc"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-gray-500 hover:text-gray-300"
            }`}
            title="Alacaklı olandan borçluya"
          >
            📉 Alacaklı
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              handleReportPrint(items, showArchived ? "Arşivlenmiş" : "Aktif")
            }
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 text-[10px] font-bold transition-all active:scale-95"
          >
            🖨️ YAZDIR
          </button>
          <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                !showArchived
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              AKTİF CARİLER
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                showArchived
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ARŞİVLENMİŞ
            </button>
          </div>
          <span className="text-xs text-gray-500 font-mono bg-gray-800 px-3 py-1 rounded-full">
            Güncel Durum
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-gray-800 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="p-5">Cari Hesap Kodu</th>
              <th className="p-5">Unvanı</th>
              <th className="p-5 text-right">Bakiye Borç</th>
              <th className="p-5 text-right">Bakiye Alacak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50 font-mono text-sm text-gray-200">
            {(Array.isArray(items) ? items : []).length > 0 ? (
              (Array.isArray(items) ? items : []).map((row, i) => {
                const balance = Number(row?.finalBalance || 0);
                return (
                  <tr
                    key={i}
                    className="hover:bg-blue-500/5 transition-colors group"
                  >
                    <td className="p-5 text-gray-500 group-hover:text-gray-300">
                      {row.customer?.code || "-"}
                    </td>
                    <td className="p-5 font-bold max-w-[400px] truncate">
                      {row.customer?.name || "Bilinmeyen Cari"}
                    </td>
                    {/* Bakiye Borç Sütunu */}
                    <td className="p-5 text-right text-emerald-400 font-bold">
                      {balance > 0
                        ? balance.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })
                        : "0,00"}{" "}
                      ₺
                    </td>
                    {/* Bakiye Alacak Sütunu */}
                    <td className="p-5 text-right text-orange-400 font-bold">
                      {balance < 0
                        ? Math.abs(balance).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })
                        : "0,00"}{" "}
                      ₺
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-20 text-center text-gray-600 italic"
                >
                  Veri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
          {/* Genel Toplam Satırı */}
          <tfoot className="bg-gray-900/60 font-bold border-t-2 border-gray-800">
            <tr>
              <td
                colSpan="2"
                className="p-6 text-blue-400 text-lg uppercase tracking-tighter"
              >
                GENEL TOPLAM
              </td>
              <td className="p-6 text-right text-emerald-400 text-xl font-black">
                {totals.debit.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </td>
              <td className="p-6 text-right text-orange-400 text-xl font-black">
                {totals.credit.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BalanceStatusReport;
