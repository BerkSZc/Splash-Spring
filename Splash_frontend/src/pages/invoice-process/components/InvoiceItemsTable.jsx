import MaterialSearchSelect from "../../../components/MaterialSearchSelect.jsx";
import MaterialPriceTooltip from "../../../components/MaterialPriceTooltip.jsx";

export default function InvoiceItemsTable({
  mode,
  items,
  materials,
  customerId,
  onItemChange,
  onAddItem,
  onRemoveItem,
  currencyRates,
  onRateChange,
  formatNumber,
}) {
  return (
    <div className="space-y-6">
      {/* --- DÖVİZ KURLARI GİRİŞ ALANI --- */}
      <div className="flex flex-wrap gap-4 bg-gray-900/40 border border-gray-800 p-4 rounded-3xl">
        <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-700">
          <span className="text-emerald-400 font-bold text-xs tracking-widest">
            USD
          </span>
          <input
            type="text"
            step="0.0001"
            placeholder="43.25"
            className="bg-transparent text-white outline-none w-24 font-mono text-sm"
            value={currencyRates?.usd || ""}
            onChange={(e) => onRateChange("usdSellingRate", e.target.value)}
          />
          <span className="text-gray-500 text-xs font-bold">₺</span>
        </div>

        <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-700">
          <span className="text-blue-400 font-bold text-xs tracking-widest">
            EUR
          </span>
          <input
            type="text"
            step="0.0001"
            placeholder="48.51"
            className="bg-transparent text-white outline-none w-24 font-mono text-sm"
            value={currencyRates?.eur || ""}
            onChange={(e) => onRateChange("eurSellingRate", e.target.value)}
          />
          <span className="text-gray-500 text-xs font-bold">₺</span>
        </div>

        <div className="flex-1 flex items-center justify-end">
          <p className="text-[10px] text-gray-500 italic max-w-[200px] text-right">
            * Bu kurlar faturanın yazdırılan nüshasında görünecektir.
          </p>
        </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-visible">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Fatura Kalemleri
          </h3>
        </div>
        <div
          className="overflow-x-auto p-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-4 py-2">Malzeme</th>
                <th className="px-4 py-2">Miktar</th>
                <th className="px-4 py-2">Birim Fiyat</th>
                <th className="px-4 py-2">KDV %</th>
                <th className="px-4 py-2 text-right">KDV Tutarı</th>
                <th className="px-4 py-2 text-right">Satır Toplamı</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(items) ? items : []).map((item, i) => (
                <tr key={i} className="bg-gray-800/50 group">
                  <td className="px-4 py-3 rounded-l-xl w-1/3">
                    <MaterialSearchSelect
                      materials={materials}
                      value={item?.materialId}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      onChange={(id) => onItemChange(mode, i, "materialId", id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={formatNumber(item?.quantity) || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddItem(mode);
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "");
                        onItemChange(mode, i, "quantity", val);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={formatNumber(item?.unitPrice) || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddItem(mode);
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.,]/g, "");
                          onItemChange(mode, i, "unitPrice", val);
                        }}
                      />
                      <MaterialPriceTooltip
                        materialId={item?.materialId}
                        customerId={customerId}
                        onSelect={(p, e) => {
                          if (e) e.stopPropagation();
                          onItemChange(mode, i, "unitPrice", p);
                        }}
                        disabled={!item?.materialId}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item?.kdv || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddItem(mode);
                        }
                      }}
                      onChange={(e) =>
                        onItemChange(mode, i, "kdv", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-gray-400">
                    {(
                      (Number(item?.unitPrice) *
                        Number(item?.quantity) *
                        Number(item?.kdv)) /
                        100 || 0
                    ).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative group">
                      <input
                        type="text"
                        step="0.01"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-right font-mono font-bold text-blue-400 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={formatNumber(item?.lineTotal) || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddItem(mode);
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.,]/g, "");
                          onItemChange(mode, i, "lineTotal", val);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none group-focus-within:hidden">
                        ₺
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 rounded-r-xl">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(mode, i)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => onAddItem(mode)}
            className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold px-4 py-2 rounded-lg transition-all"
          >
            <span className="text-xl">+</span> Yeni Kalem Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
