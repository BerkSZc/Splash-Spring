import { generateStatementHTML } from "../../../utils/statementPrintHelpers.js";

export default function StatementModal({
  showPrintModal,
  setShowPrintModal,
  selectedCustomer,
  statementData,
  year,
}) {
  if (!showPrintModal) return null;

  const handlePrint = () => {
    const html = generateStatementHTML(selectedCustomer, statementData, year);
    const printWindow = window.open("", "_blank", "width=1000, height=800");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setShowPrintModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-[300] p-4 md:p-10 overflow-hidden">
      <div className="bg-gray-900 w-full max-w-6xl max-h-full rounded-[2.5rem] flex flex-col border border-gray-800 shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            📊 Ekstre Önizleme
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrintModal(false)}
              className="px-6 py-2.5 bg-gray-800 text-gray-400 rounded-xl font-bold"
            >
              Kapat
            </button>
            <button
              onClick={handlePrint}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <span>🖨️</span> Yazdır
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-950 flex justify-center items-start">
          {/* shadow ve padding ayarlarıyla A4 formu */}
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[15mm] text-black shadow-[0_0_50px_rgba(0,0,0,0.5)] box-border">
            <div className="flex justify-between border-b-4 border-black pb-4 mb-8">
              <h1 className="text-3xl font-black uppercase">Cari Ekstre</h1>
              <div className="text-right font-bold">{year}</div>
            </div>
            <div className="mb-8 p-5 border-l-8 border-black bg-gray-50">
              <h3 className="text-xl font-bold">{selectedCustomer?.name}</h3>
              <p className="text-sm">{selectedCustomer?.address}</p>
            </div>
            <table className="w-full text-[11px] table-fixed border-collapse">
              <thead className="border-y-2 border-black">
                <tr className="bg-gray-100 uppercase font-bold">
                  <td className="p-2">Tarih</td>
                  <td className="p-2">Açıklama</td>
                  <td className="p-2 text-right">Borç</td>
                  <td className="p-2 text-right">Alacak</td>
                  <td className="p-2 text-right">Bakiye</td>
                </tr>
              </thead>
              <tbody>
                {statementData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="p-2 align-top ">{item.date}</td>
                    <td className="p-2 align-top break-all">{item.desc}</td>
                    <td className="p-2 text-right align-top">
                      {item.debit > 0
                        ? item.debit.toLocaleString("tr-TR")
                        : "-"}
                    </td>
                    <td className="p-2 text-right align-top">
                      {item.credit > 0
                        ? item.credit.toLocaleString("tr-TR")
                        : "-"}
                    </td>
                    <td className="p-2 text-right align-top font-bold whitespace-nowrap">
                      {item.balance.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
