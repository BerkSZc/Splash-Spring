export const generateStatementHTML = (customer, statementData, year) => {
  const totalDebit = statementData.reduce(
    (sum, item) => sum + (item.debit || 0),
    0,
  );
  const totalCredit = statementData.reduce(
    (sum, item) => sum + (item.credit || 0),
    0,
  );
  const finalBalance = totalDebit - totalCredit;

  const rows = statementData
    .map(
      (item) => `
    <tr style="page-break-inside: avoid;">
      <td style="padding: 6px; border-bottom: 1px solid #ddd; font-family: monospace; font-size: 10px;">${
        item.date
      }</td>
      <td style="padding: 6px; border-bottom: 1px solid #ddd; font-size: 10px; word-wrap: break-word;">${
        item.desc
      }</td>
      <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10px;">
        ${
          item.debit > 0
            ? item.debit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
            : ""
        }
      </td>
      <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10px;">
        ${
          item.credit > 0
            ? item.credit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })
            : ""
        }
      </td>
      <td style="padding: 6px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 10px; white-space: nowrap;">
        ${Math.abs(item.balance).toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
        })} 
        <span style="font-size: 8px;">${
          item.balance >= 0 ? "(B)" : "(A)"
        }</span>
      </td>
    </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ekstre - ${customer?.name}</title>
        <style>
          @page { 
            size: A4; 
            margin: 15mm; /* Kağıdın kendi boşluğu */
          }
          html, body { 
            background: white !important; 
            color: black; 
            margin: 0; 
            padding: 0; 
            width: 100%;
          }
          .print-area {
            width: 100%; /* Sabit mm yerine %100 kullanıyoruz */
            margin: 0;
            background: white;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            table-layout: fixed; /* Sütunların dışarı taşmasını engeller */
          }
          th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
          td, th { overflow: hidden; text-overflow: ellipsis; }

          /* Sütun oranlarını sabitleyelim */
          .col-tarih { width: 12%; }
          .col-desc { width: 44%; }
          .col-tutar { width: 14.5%; }

          @media print {
            .print-area { padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-area">
          <div style="display: flex; justify-content: space-between; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
              <h1 style="font-size: 20px; font-weight: 900; margin: 0;">CARİ HESAP EKSTRESİ</h1>
              <p style="font-size: 11px; margin: 4px 0;">Dönem: 01.01.${year} - 31.12.${year}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 16px; margin: 0;">SÖZCÜ MATBAA</h2>
              <p style="font-size: 9px; margin: 4px 0;">Rapor Tarihi: ${new Date().toLocaleDateString(
                "tr-TR",
              )}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid black; background-color: #f9fafb;">
            <p style="font-size: 9px; color: #666; font-weight: bold; margin: 0 0 2px 0;">MÜŞTERİ BİLGİLERİ</p>
            <p style="font-size: 14px; font-weight: bold; margin: 0;">${
              customer?.name || ""
            }</p>
            <p style="font-size: 10px; margin: 3px 0;">${
              customer?.address || ""
            }</p>
            <p style="font-size: 10px; margin: 0;">${
              customer?.vdNo ? "VN: " + customer.vdNo : ""
            }</p>
          </div>

          <table>
            <thead>
              <tr style="border-top: 2px solid black; border-bottom: 2px solid black;">
                <th class="col-tarih" style="padding: 8px; text-align: left; font-size: 10px;">Tarih</th>
                <th class="col-desc" style="padding: 8px; text-align: left; font-size: 10px;">Açıklama</th>
                <th class="col-tutar" style="padding: 8px; text-align: right; font-size: 10px;">Borç</th>
                <th class="col-tutar" style="padding: 8px; text-align: right; font-size: 10px;">Alacak</th>
                <th class="col-tutar" style="padding: 8px; text-align: right; font-size: 10px;">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold; background-color: #f3f4f6; border-top: 2px solid black;">
                <td colspan="2" style="padding: 8px; text-align: right; font-size: 10px;">TOPLAM</td>
                <td style="padding: 8px; text-align: right; font-size: 10px;">${totalDebit.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 },
                )} ₺</td>
                <td style="padding: 8px; text-align: right; font-size: 10px;">${totalCredit.toLocaleString(
                  "tr-TR",
                  { minimumFractionDigits: 2 },
                )} ₺</td>
                <td style="padding: 8px; text-align: right; font-size: 10px; background-color: #e5e7eb;">
                  ${Math.abs(finalBalance).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })} ₺
                  <span style="font-size: 8px;">${
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
            }, 300);
          };
        </script>
      </body>
    </html>`;
};
