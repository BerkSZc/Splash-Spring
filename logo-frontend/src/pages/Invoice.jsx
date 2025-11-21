import { useEffect, useState } from "react";
import { usePurchaseInvoice } from "../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../backend/store/useSalesInvoice";

export default function InvoicePage() {
  const { getAllPurchaseInvoices, purchase } = usePurchaseInvoice();
  const { getAllSalesInvoices, sales } = useSalesInvoice();

  const [invoiceType, setInvoiceType] = useState("purchase"); // "purchase" veya "sales"
  const [editingInvoice, setEditingInvoice] = useState(null); // Düzenlenecek fatura

  useEffect(() => {
    getAllPurchaseInvoices();
    getAllSalesInvoices();
  }, []);

  const invoicesToDisplay = invoiceType === "purchase" ? purchase : sales;

  // Düzenle butonuna basıldığında çalışacak
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    // Burada bir modal açabilir veya mevcut formu doldurabilirsin
    console.log("Düzenlenecek fatura:", invoice);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Faturalar</h2>
        {/* Fatura tipi seçimi */}
        <select
          value={invoiceType}
          onChange={(e) => setInvoiceType(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="purchase">Satın Alma Faturası</option>
          <option value="sales">Satış Faturası</option>
        </select>
      </div>

      {/* Fatura tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Fatura No</th>
              <th className="p-2 text-left">Tarih</th>
              <th className="p-2 text-left">Müşteri</th>
              <th className="p-2 text-right">Toplam Tutar</th>
              <th className="p-2 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {invoicesToDisplay?.length > 0 ? (
              invoicesToDisplay.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{inv.fileNo}</td>
                  <td className="p-2">{inv.date}</td>
                  <td className="p-2">{inv.customer?.name}</td>
                  <td className="p-2 text-right">
                    {inv.totalPrice?.toFixed(2)} ₺
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEdit(inv)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-4 text-gray-500 italic"
                >
                  Fatura bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Düzenleme bilgisi göster (opsiyonel) */}
      {editingInvoice && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2 text-gray-700">
            Düzenlenen Fatura: {editingInvoice.fileNo}
          </h3>
          <p>Müşteri: {editingInvoice.customer?.name}</p>
          <p>Tarih: {editingInvoice.date}</p>
          <p>Toplam: {editingInvoice.totalPrice?.toFixed(2)} ₺</p>
          <button
            onClick={() => setEditingInvoice(null)}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Düzenlemeyi Kapat
          </button>
        </div>
      )}
    </div>
  );
}
