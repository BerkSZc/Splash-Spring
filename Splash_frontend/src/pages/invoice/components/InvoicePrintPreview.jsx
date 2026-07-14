import { useEffect, useState } from "react";
import { useVoucher } from "../../../../backend/store/useVoucher";
import { useTenant } from "../../../context/TenantContext";
import { useYear } from "../../../context/YearContext";

export default function InvoicePrintPreview({
  printItem,
  onCancel,
  onExecutePrint,
}) {
  const { tenant } = useTenant();
  const { year } = useYear();

  if (!printItem) return null;

  const kdvToplam = Number(printItem.kdvToplam || 0);
  const totalPrice = Number(printItem.totalPrice || 0);
  const subTotal = totalPrice - kdvToplam;

  const currentBalance = Number(
    printItem?.customer?.finalBalance ??
      printItem?.customer?.openingVoucher?.finalBalance ??
      0,
  );

  const usdRate = Number(printItem?.usdSellingRate || 0);
  const eurRate = Number(printItem?.eurSellingRate || 0);

  const isPurchase = printItem?.invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";

  const formattedDate = printItem?.date?.includes("-")
    ? printItem.date.split("-").reverse().join(".")
    : printItem?.date;
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/90 flex justify-center items-center z-[9999] backdrop-blur-sm md:p-10 text-left">
      <div className="bg-[#1a1f2e] border border-gray-800 w-full max-w-5xl max-h-[95vh] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        {/* Header - Kontrol Paneli */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="text-left">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                👁️
              </span>
              Fatura Önizleme
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {printItem?.fileNo || ""} numaralı belge yazdırılmaya hazır
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-bold hover:bg-gray-700 transition"
            >
              Vazgeç
            </button>
            <button
              onClick={() =>
                onExecutePrint(printItem, { finalBalance: currentBalance })
              }
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg flex items-center gap-2"
            >
              <span>🖨️</span> Şimdi Yazdır
            </button>
          </div>
        </div>

        {/* Önizleme Alanı */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gray-800/30 flex justify-center items-start">
          <div className="bg-white w-[210mm] min-h-[297mm] p-[12mm] shadow-2xl text-black font-sans origin-top transform scale-[0.65] md:scale-95 lg:scale-100 rounded-lg">
            {/* Üst Logo ve Başlık Bilgisi */}
            <div className="pb-6 mb-8 flex justify-between items-start border-b border-gray-200">
              <div className="flex flex-col gap-1 text-left">
                <h2 className="text-lg font-extrabold text-blue-900 leading-tight">
                  SÖZCÜ MATBAA <br /> MALZEMELERİ LTD. ŞTİ.
                </h2>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed uppercase">
                  Himaye-i Etfal Sok. Aydoğmuş İş Hanı 7/1
                  <br />
                  Cağaloğlu / İSTANBUL
                  <br />
                  <span className="font-semibold text-gray-900">
                    VERGİ NO: 7800063113
                  </span>
                </p>
              </div>

              <div className="text-right flex flex-col items-end pt-1">
                <h1
                  className="text-base font-bold tracking-tight"
                  style={{ color: "#000000" }}
                >
                  {typeTitle.toUpperCase()}
                </h1>
                <p className="font-mono font-bold text-xs tracking-tight text-gray-700 mt-1">
                  NO: <b>{printItem?.fileNo || ""}</b>
                </p>
                <p className="italic text-[10px] text-gray-500 mt-0.5">
                  Tarih: {formattedDate || ""}
                </p>
              </div>
            </div>

            {/* Müşteri Kartı */}
            <div className="flex justify-end mb-10">
              <div
                className="p-4 bg-[#f9fafb] rounded-l-xl border border-gray-200 border-r-4 w-full max-w-[380px] text-right"
                style={{ borderRightColor: "#000000" }}
              >
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  FATURA EDİLEN MÜŞTERİ
                </h3>
                <p className="text-sm font-bold uppercase text-gray-900 leading-tight mb-1">
                  {printItem?.customer?.name || "—"}
                </p>
                <p className="text-[11px] text-gray-600 leading-snug ml-auto max-w-[280px] mb-2">
                  {printItem?.customer?.address ||
                    "Adres bilgisi mevcut değil."}
                </p>
                <span className="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold font-mono text-gray-600">
                  VD & NO: {printItem?.customer?.vdNo || "—"}
                </span>
              </div>
            </div>

            {/* Kalemler Tablosu */}
            <table className="w-full text-left mb-8 border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[9px] font-bold uppercase text-gray-400">
                  <th className="py-3 px-2">Açıklama / Ürün Kodu</th>
                  <th className="py-3 px-2 text-center">Miktar</th>
                  <th className="py-3 px-2 text-right">Birim Fiyat</th>
                  <th className="py-3 px-2 text-right">KDV Tutarı</th>
                  <th className="py-3 px-2 text-right">Satır Toplam</th>
                </tr>
              </thead>
              <tbody className="text-[11px] divide-y divide-gray-50">
                {(Array.isArray(printItem.items) ? printItem.items : []).map(
                  (item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-gray-900">
                          {item?.material?.comment || ""}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-gray-600">
                        {item?.quantity ?? 0}
                        <span className="text-[9px] font-bold text-gray-400 ml-1">
                          {item?.unit || ""}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-600">
                        {(Number(item?.unitPrice) || 0).toLocaleString(
                          "tr-TR",
                          { minimumFractionDigits: 2 },
                        )}{" "}
                        ₺
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-gray-500">
                        {(Number(item?.kdvTutar) || 0).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-gray-900">
                        {(Number(item?.lineTotal) || 0).toLocaleString(
                          "tr-TR",
                          { minimumFractionDigits: 2 },
                        )}{" "}
                        ₺
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* Matrah, KDV ve Genel Toplam Katmanı */}
            <div className="flex justify-between items-stretch gap-10 mt-6 mb-8 bg-white">
              <div className="flex flex-col justify-between w-1/3">
                <div className="mt-auto"></div>
              </div>

              <div className="space-y-2 bg-white min-w-[300px]">
                <div className="flex justify-between text-[10px] text-gray-500 font-medium px-1 gap-12">
                  <span>ARA TOPLAM (MATRAH)</span>
                  <span className="font-mono text-gray-800">
                    {subTotal.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium px-1 pb-1">
                  <span>TOPLAM KDV</span>
                  <span class="font-mono text-gray-800">
                    {kdvToplam.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-50/30">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 mr-8">
                    GENEL TOPLAM
                  </span>
                  <span
                    className="text-xl font-extrabold tracking-tight"
                    style={{ color: "#000000" }}
                  >
                    {totalPrice.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>
                </div>
              </div>
            </div>

            {/* Genel Açıklamalar */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Genel Açıklamalar
                </h4>
                <p className="text-xs text-gray-900 font-bold uppercase tracking-wide">
                  Son Cari Hesap Bakiyesi:{" "}
                  <span className="text-sm font-extrabold text-black font-mono px-2 py-0.5 bg-yellow-100 rounded border border-yellow-200">
                    {currentBalance.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ₺
                  </span>{" "}
                  Dir.
                </p>
              </div>

              {/* Banka Bilgileri */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[9px] font-bold uppercase text-gray-400 border-b border-gray-100">
                      <th className="pb-2 w-1/3">BANKA ADI</th>
                      <th className="pb-2 font-mono">İBAN NO</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 divide-y divide-gray-50 font-medium">
                    <tr>
                      <td className="py-2 text-gray-900 font-semibold">
                        Enpara Bank
                      </td>
                      <td className="py-2 font-mono tracking-wide text-gray-700">
                        TR10 0015 7000 0000 0098 6528 18
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-900 font-semibold">
                        Denizbank Cağaloğlu Şb.
                      </td>
                      <td className="py-2 font-mono tracking-wide text-gray-700">
                        TR88 0013 4000 0018 5773 3000 10
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ödeme Notu */}
              <div className="flex justify-between items-center text-[10px] bg-white pt-2 border-collapse">
                <div className="text-gray-500 font-mono">
                  <span className="font-bold text-gray-700">Ödeme Notu:</span>{" "}
                  EURO:{" "}
                  <span className="font-bold text-gray-900 mr-4">
                    {eurRate > 0
                      ? eurRate.toLocaleString("tr-TR", {
                          minimumFractionDigits: 4,
                        }) + " ₺"
                      : "---"}
                  </span>
                  DOLAR:{" "}
                  <span className="font-bold text-gray-900">
                    {usdRate > 0
                      ? usdRate.toLocaleString("tr-TR", {
                          minimumFractionDigits: 4,
                        }) + " ₺"
                      : "---"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
