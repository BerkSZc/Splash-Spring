export const generateStatementHTML = (customer, statementData, year) => {
  const totalDebit = statementData.reduce(
    (sum, item) => sum + (item.debit || 0),
    0
  );
  const totalCredit = statementData.reduce(
    (sum, item) => sum + (item.credit || 0),
    0
  );
  const finalBalance = totalDebit - totalCredit;

  const rows = statementData
    .map(
      (item) => `
    <tr style="page-break-inside: avoid;">
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 11px; color: black;">${
        item.date
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px; word-break: break-word; color: black;">${
        item.desc
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 11px; color: black;">
        ${
          item.debit > 0
            ? item.debit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
            : ""
        }
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 11px; color: black;">
        ${
          item.credit > 0
            ? item.credit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
            : ""
        }
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; font-size: 11px; color: black; white-space: nowrap;">
        ${Math.abs(item.balance).toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
        })} 
        <span style="font-size: 9px; margin-left: 2px;">${
          item.balance >= 0 ? "(B)" : "(A)"
        }</span>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html style="background-color: white !important;">
      <head>
        <title>Ekstre - ${customer?.name}</title>
        <style>
          /* Dış dünyadan gelen her şeyi sıfırla */
          html, body { 
            background: white !important; 
            color: black !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important;
            height: auto !important;
          }
          
          .print-area {
            background-color: white !important;
            width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            min-height: 297mm;
          }

          table { width: 100%; border-collapse: collapse; table-layout: fixed; background: white !important; }
          thead { display: table-header-group; }
          
          @media print {
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            .print-area { width: 100%; margin: 0; padding: 15mm; box-shadow: none; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-area">
          <div style="display: flex; justify-content: space-between; border-bottom: 4px solid black; padding-bottom: 15px; margin-bottom: 20px;">
            <div style="text-align: left;">
              <h1 style="font-size: 24px; font-weight: 900; color: black; margin: 0;">CARI HESAP EKSTRESI</h1>
              <p style="font-size: 12px; font-weight: bold; color: #444; margin: 5px 0 0 0;">Dönem: 01.01.${year} - 31.12.${year}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: bold; color: black; margin: 0;">SÖZCÜ MATBAA</h2>
              <p style="font-size: 10px; color: black; margin: 5px 0 0 0;">Rapor Tarihi: ${new Date().toLocaleDateString(
                "tr-TR"
              )}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px; padding: 15px; border-left: 5px solid black; background-color: #f9fafb;">
            <p style="font-size: 10px; color: #666; text-transform: uppercase; font-weight: 900; margin: 0 0 4px 0;">Müşteri Bilgileri</p>
            <p style="font-size: 16px; font-weight: bold; color: black; margin: 0;">${
              customer?.name || ""
            }</p>
            <p style="font-size: 11px; color: #333; margin: 5px 0 0 0;">${
              customer?.address || ""
            }</p>
            <p style="font-size: 11px; color: #333; margin: 2px 0 0 0;">${
              customer?.vdNo ? "VN: " + customer.vdNo : ""
            }</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6 !important; border-top: 2px solid black; border-bottom: 2px solid black;">
                <th style="width: 15%; padding: 8px; text-align: left; font-size: 11px; color: black;">Tarih</th>
                <th style="width: 40%; padding: 8px; text-align: left; font-size: 11px; color: black;">Açıklama</th>
                <th style="width: 15%; padding: 8px; text-align: right; font-size: 11px; color: black;">Borç</th>
                <th style="width: 15%; padding: 8px; text-align: right; font-size: 11px; color: black;">Alacak</th>
                <th style="width: 15%; padding: 8px; text-align: right; font-size: 11px; color: black;">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold; background-color: #f3f4f6 !important; border-top: 2px solid black;">
                <td colspan="2" style="padding: 10px; text-align: right; font-size: 11px; color: black; text-transform: uppercase;">Toplam</td>
                <td style="padding: 10px; text-align: right; font-size: 11px; color: black;">${totalDebit.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 }
                )} ₺</td>
                <td style="padding: 10px; text-align: right; font-size: 11px; color: black;">${totalCredit.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 }
                )} ₺</td>
                <td style="padding: 10px; text-align: right; background-color: #e5e7eb !important; font-size: 11px; color: black;">
                  ${Math.abs(finalBalance).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺
                  <span style="font-size: 9px;">${
                    finalBalance >= 0 ? "(B)" : "(A)"
                  }</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          };
        </script>
      </body>
    </html>`;
};
