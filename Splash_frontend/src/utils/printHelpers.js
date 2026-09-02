// Fatura yazdırma templatei
export const generateInvoiceHTML = (
  inv,
  invoiceType,
  customers,
  company,
  isForEmail = false,
) => {
  const currentCustomer = (Array.isArray(customers) ? customers : []).find(
    (c) => Number(c.id) === Number(inv?.customerId),
  );

  const kdvToplam = Number(inv?.kdvToplam ?? 0);
  const totalPrice = Number(inv?.totalPrice ?? 0);
  const subTotal = totalPrice - kdvToplam || 0;

  const isPurchase = invoiceType === "purchase";
  const typeTitle = isPurchase ? "Satın Alma Faturası" : "Satış Faturası";
  const primaryColor = isPurchase ? "#111827" : "#1e3a8a";

  const currentBalance = Number(inv?.finalBalance ?? 0);

  const usdRate = Number(inv?.usdSellingRate ?? 0);
  const eurRate = Number(inv?.eurSellingRate ?? 0);

  const formattedDate = inv?.date?.includes("-")
    ? inv.date.split("-").reverse().join(".")
    : inv?.date;

  return `
    <div id="invoice-render-box" style="width: 794px; min-height: 1120px; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; box-sizing: border-box; margin: 0 auto;">
      
      <!-- Üst Başlık ve Fatura Türü -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 28px;">
        <tr>
          <td style="vertical-align: top; width: 60%; text-align: left;">
            <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin: 0 0 4px 0; line-height: 1.2;">
              ${company?.name || "ŞİRKET ADI"}
            </h2>
            <p style="font-size: 10px; color: #6b7280; margin: 0; line-height: 1.5; text-transform: uppercase;">
              ${company?.companyAddress || "—"}<br>
              <span style="font-weight: 600; color: #111827;">VERGİ NO: ${company?.vdNo || "—"}</span>
            </p>
          </td>
          <td style="vertical-align: top; width: 40%; text-align: right;">
            <h1 style="font-size: 16px; font-weight: 700; color: ${primaryColor}; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -0.5px;">
              ${typeTitle}
            </h1>
            <p style="font-size: 12px; font-family: monospace; font-weight: 700; color: #374151; margin: 0 0 2px 0;">
              NO: <b>${inv?.fileNo || ""}</b>
            </p>
            <p style="font-size: 10px; font-style: italic; color: #6b7280; margin: 0;">
              Tarih: ${formattedDate || ""}
            </p>
          </td>
        </tr>
      </table>

      <!-- Müşteri Kartı (Sağa Hizalı Kutu) -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%; vertical-align: top;">
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-right: 4px solid ${primaryColor}; border-radius: 12px; padding: 16px 20px; text-align: right;">
              <div style="font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                FATURA EDİLEN MÜŞTERİ
              </div>
              <div style="font-size: 14px; font-weight: 700; text-transform: uppercase; color: #111827; margin-bottom: 4px; line-height: 1.3;">
                ${inv?.customerName || "—"}
              </div>
              <div style="font-size: 11px; color: #4b5563; line-height: 1.4; margin-bottom: 10px;">
                ${currentCustomer?.address || "Adres bilgisi mevcut değil."}
              </div>
              <div>
                <span style="display: inline-block; white-space: nowrap; padding: 4px 8px; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 6px; font-size: 10px; font-weight: 600; font-family: monospace; color: #374151;">
                  VD & NO: ${currentCustomer?.vdNo || "—"}
                </span>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Malzeme Kalemleri Tablosu -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; background-color: #f9fafb;">
            <th style="padding: 10px 8px; text-align: left; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 44%;">Açıklama / Ürün Kodu</th>
            <th style="padding: 10px 8px; text-align: center; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 12%;">Miktar</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 14%;">Birim Fiyat</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 14%;">KDV Tutarı</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 16%;">Satır Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${(Array.isArray(inv?.items) ? inv.items : [])
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 600; color: #111827;">
                ${item?.materialName || ""}
              </td>
              <td style="padding: 12px 8px; text-align: center; font-size: 12px; font-family: monospace; color: #4b5563;">
                ${item?.quantity ?? 0} <span style="font-size: 9px; font-weight: 700; color: #9ca3af; margin-left: 2px;">${item?.unit || ""}</span>
              </td>
              <td style="padding: 12px 8px; text-align: right; font-size: 12px; font-family: monospace; color: #4b5563;">
                ${(Number(item?.unitPrice) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </td>
              <td style="padding: 12px 8px; text-align: right; font-size: 12px; font-family: monospace; color: #6b7280;">
                ${(Number(item?.kdvTutar) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </td>
              <td style="padding: 12px 8px; text-align: right; font-size: 12px; font-weight: 700; color: #111827;">
                ${(Number(item?.lineTotal) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <!-- Toplamlar Bölümü -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 30px;">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%; vertical-align: top;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 10px; font-weight: 500; color: #6b7280; padding: 4px 0;">ARA TOPLAM (MATRAH)</td>
                <td style="font-size: 11px; font-family: monospace; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0;">
                  ${subTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="font-size: 10px; font-weight: 500; color: #6b7280; padding: 4px 0 8px 0;">TOPLAM KDV</td>
                <td style="font-size: 11px; font-family: monospace; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0 8px 0;">
                  ${kdvToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 12px; border: 2px solid #111827; background-color: #f9fafb;">
                    <span style="font-size: 10px; font-weight: 700; color: #4b5563; text-transform: uppercase;">GENEL TOPLAM</span>
                    <span style="font-size: 18px; font-weight: 800; color: ${primaryColor};">
                      ${totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Genel Açıklamalar -->
      <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">
          Genel Açıklamalar
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase;">
          Son Cari Hesap Bakiyesi:
          <span style="font-size: 13px; font-family: monospace; font-weight: 800; background-color: #fef08a; padding: 2px 8px; border-radius: 6px; border: 1px solid #fef08a; margin: 0 4px;">
            ${currentBalance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
          </span>
          Dir.
        </div>
      </div>

      <!-- Fatura Açıklaması / Notu -->
      <div style="margin-top: 16px; padding: 14px 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">
          Fatura Açıklaması / Notu
        </div>
        <div style="font-size: 12px; font-weight: 600; color: #1f2937; text-transform: uppercase;">
          ${company?.invoiceDescription || "—"}
        </div>
      </div>

      <!-- Döviz Kurları Satırı -->
      <div style="margin-top: 18px; font-size: 11px; line-height: 20px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
        <span style="font-weight: 700; color: #111827;">Ödeme Notu:</span>&nbsp;&nbsp;
        EURO:&nbsp;<span style="font-weight: 700; color: #111827; margin-right: 20px;">${eurRate > 0 ? eurRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
        DOLAR:&nbsp;<span style="font-weight: 700; color: #111827;">${usdRate > 0 ? usdRate.toLocaleString("tr-TR", { minimumFractionDigits: 4 }) + " ₺" : "---"}</span>
      </div>

    </div>
    ${
      !isForEmail
        ? `
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 250);
          };
        </script>
        `
        : ""
    }
  `;
};
