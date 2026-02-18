import { useInvoiceLogic } from "./hooks/useInvoiceLogic.js";
import CustomerSearchSelect from "../../components/CustomerSearchSelect";
import InvoiceItemsTable from "./components/InvoiceItemsTable";
import LoadingScreen from "../../components/LoadingScreen.jsx";

export default function InvoiceForm() {
  const { state, handlers } = useInvoiceLogic();
  const { mode, salesForm, purchaseForm } = state;

  const actualForm = state?.currentForm || { items: [] };
  const actualCalc = state?.currentCalc || { total: 0, kdv: 0, grandTotal: 0 };
  const actualCustomers = state?.customers || [];
  const actualMaterials = state?.materials || [];
  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-gray-100 p-6 lg:p-12">
      {state.isLoading && (
        <LoadingScreen
          message="İŞLEM YAPILIYOR"
          subMessage="Veritabanı senkronize ediliyor, lütfen bekleyiniz..."
        />
      )}
      <div className="max-w-6xl mx-auto space-y-8 text-left">
        {/* BAŞLIK VE MOD SEÇİMİ */}
        <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800 backdrop-blur-sm">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Fatura Oluştur
            </h1>
            <p className="text-gray-400 mt-1">
              {mode === "sales" ? "Müşteriye Satış" : "Firmadan Satın Alma"}
            </p>
          </div>
          <select
            className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none font-bold"
            value={mode}
            onChange={(e) => handlers.setMode(e.target.value)}
          >
            <option value="sales">Satış Faturası</option>
            <option value="purchase">Satın Alma Faturası</option>
          </select>
        </div>

        <form onSubmit={handlers.submitForm} className="space-y-8">
          {/* ÜST BİLGİLER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem]">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Tarih
              </label>
              <input
                type="date"
                required
                value={actualForm.date || ""}
                onChange={(e) =>
                  mode === "sales"
                    ? handlers.setSalesForm({
                        ...salesForm,
                        date: e.target.value,
                      })
                    : handlers.setPurchaseForm({
                        ...purchaseForm,
                        date: e.target.value,
                      })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Belge No
              </label>
              <input
                type="text"
                required
                placeholder="Örn: FAT2025001"
                value={actualForm.fileNo}
                onChange={(e) =>
                  mode === "sales"
                    ? handlers.setSalesForm({
                        ...salesForm,
                        fileNo: e.target.value,
                      })
                    : handlers.setPurchaseForm({
                        ...purchaseForm,
                        fileNo: e.target.value,
                      })
                }
                className="w-full uppercase bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Müşteri / Firma
              </label>
              <CustomerSearchSelect
                customers={actualCustomers}
                value={actualForm.customerId}
                onChange={(id) =>
                  mode === "sales"
                    ? handlers.setSalesForm({ ...salesForm, customerId: id })
                    : handlers.setPurchaseForm({
                        ...purchaseForm,
                        customerId: id,
                      })
                }
              />
            </div>
          </div>

          {/* TABLO VE DÖVİZ KURLARI */}
          <InvoiceItemsTable
            formatNumber={state.formatNumber}
            mode={mode}
            items={Array.isArray(actualForm.items) ? actualForm.items : []}
            materials={actualMaterials}
            customerId={actualForm.customerId}
            onItemChange={handlers.handleItemChange}
            onAddItem={handlers.addItem}
            onRemoveItem={handlers.removeItem}
            currencyRates={{
              usd: actualForm.usdSellingRate,
              eur: actualForm.eurSellingRate,
            }}
            onRateChange={handlers.handleRateChange}
          />

          {/* ALT TOPLAMLAR VE KAYDET */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800">
            <div className="space-y-2 text-gray-500 text-sm italic text-left">
              * Kalemlerin toplamı otomatik olarak hesaplanmaktadır.
            </div>
            <div className="space-y-4 text-right min-w-[280px]">
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Ara Toplam (Matrah):</span>
                <span className="font-mono text-white">
                  {(Number(actualCalc.total) || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₺
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>KDV Toplam:</span>
                <span className="font-mono text-blue-400 font-bold">
                  {(Number(actualCalc.kdv) || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₺
                </span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black border-t border-gray-800 pt-3 mt-2">
                <span className="text-white text-lg">Genel Toplam:</span>
                <span className="text-emerald-400 font-mono tracking-tighter">
                  {(Number(actualCalc.grandTotal) || 0).toLocaleString(
                    "tr-TR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}{" "}
                  ₺
                </span>
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                Faturayı Kaydet ve Sisteme İşle
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
