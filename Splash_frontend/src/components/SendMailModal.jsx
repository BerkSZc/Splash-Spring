import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { useSendMail } from "../../backend/store/useSendMail.js";

const DEFAULT_BODY =
  "Sayın Müşterimiz,\n\nFaturanız ekte PDF belgesi olarak bilgilerinize sunulmuştur.\n\nİyi çalışmalar dileriz.";

export default function SendMailModal({
  isOpen,
  onClose,
  defaultSubject = "",
  getHtmlBody,
  fileName = "Fatura.pdf",
}) {
  const { sendMail, getLastMailLog, loading } = useSendMail();
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [bodyText, setBodyText] = useState(DEFAULT_BODY);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSubject(defaultSubject);

    const loadLastLog = async () => {
      const lastLog = await getLastMailLog();
      if (lastLog) {
        if (lastLog.to) setEmails(lastLog.to);
        if (lastLog.body) setBodyText(lastLog.body);
      }
    };

    loadLastLog();
  }, [isOpen, defaultSubject]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!emails.trim()) {
      toast.error("En az bir e-posta adresi giriniz!");
      return;
    }

    try {
      setIsConvertingPdf(true);

      const rawHtml = getHtmlBody ? getHtmlBody(true) : "";
      let pdfBase64 = null;

      if (rawHtml) {
        const mountWrapper = document.createElement("div");
        mountWrapper.style.position = "fixed";
        mountWrapper.style.top = "-10000px";
        mountWrapper.style.left = "-10000px";
        mountWrapper.style.zIndex = "-1";
        mountWrapper.style.pointerEvents = "none";
        mountWrapper.innerHTML = rawHtml;
        document.body.appendChild(mountWrapper);

        const targetNode =
          mountWrapper.querySelector("#invoice-render-box") || mountWrapper;

        await new Promise((res) => setTimeout(res, 200));

        const opt = {
          margin: [8, 8, 8, 8],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 794,
            scrollY: 0,
            scrollX: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        try {
          const dataUri = await html2pdf()
            .set(opt)
            .from(targetNode)
            .outputPdf("datauristring");

          pdfBase64 = dataUri.split(",")[1];
        } finally {
          document.body.removeChild(mountWrapper);
        }
      }

      const formattedHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; font-size: 14px;">
          ${bodyText.replace(/\n/g, "<br/>")}
        </div>
      `;

      await sendMail({
        to: emails,
        subject: subject,
        body: bodyText,
        htmlContent: formattedHtml,
        attachPdfBase64: pdfBase64,
        attachFileName: fileName.endsWith(".pdf")
          ? fileName
          : `${fileName}.pdf`,
      });

      onClose();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Mail gönderilirken bir hata oluştu!";
      toast.error(backendErr);
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const isBusy = loading || isConvertingPdf;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 select-none">
      <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            ✉️ E-Posta Gönder
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Alıcı E-Posta Adresleri
            </label>
            <input
              type="text"
              required
              placeholder="ornek@mail.com; muhasebe@firma.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Birden fazla adresi <b>;</b> veya <b>,</b> ile ayırabilirsiniz.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Konu
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Açıklama / Mesaj Metni
            </label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="E-posta açıklamasını buraya yazabilirsiniz..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl hover:bg-gray-700 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              {isBusy ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs">
                    {isConvertingPdf
                      ? "PDF Hazırlanıyor..."
                      : "Gönderiliyor..."}
                  </span>
                </div>
              ) : (
                "Gönder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
