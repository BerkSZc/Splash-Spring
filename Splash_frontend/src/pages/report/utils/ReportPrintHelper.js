export const handleReportPrint = (items, typeLabel) => {
  const printWindow = window.open("", "_blank");
  const date = new Date().toLocaleDateString("tr-TR");

  // Toplamları hesapla
  const totals = items.reduce(
    (acc, curr) => {
      const balance = Number(curr.finalBalance || 0);
      if (balance > 0) acc.debit += balance;
      else if (balance < 0) acc.credit += Math.abs(balance);
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  const htmlContent = `
    <html>
      <head>
        <title>Rapor - ${date}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #000; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .info-box { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 12px; }
          th { background-color: #f8f9fa; text-transform: uppercase; }
          .text-right { text-align: right; }
          .total-footer { background-color: #eee; font-weight: bold; font-size: 14px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BORÇ / ALACAK DURUM RAPORU</h1>
        </div>
        <div class="info-box">
          <span>DURUM: ${typeLabel.toUpperCase()}</span>
          <span>TARİH: ${date}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Cari Kod</th>
              <th>Unvan</th>
              <th class="text-right">Bakiye Borç</th>
              <th class="text-right">Bakiye Alacak</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (row) => `
              <tr>
                <td>${row.customer?.code || "-"}</td>
                <td>${row.customer?.name || "-"}</td>
                <td class="text-right">${Number(row.finalBalance) > 0 ? Number(row.finalBalance).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "0,00"} ₺</td>
                <td class="text-right">${Number(row.finalBalance) < 0 ? Math.abs(Number(row.finalBalance)).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) : "0,00"} ₺</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr class="total-footer">
              <td colspan="2">GENEL TOPLAM</td>
              <td class="text-right">${totals.debit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
              <td class="text-right">${totals.credit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
            </tr>
          </tfoot>
        </table>
        <script>
          window.onload = function() { 
            window.print(); 
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
