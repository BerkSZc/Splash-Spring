import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useExportXml = create(() => ({
  exportPurchaseInvoice: async (year) => {
    try {
      const response = await axiosInstance.get("/export/purchase-invoices", {
        params: { year },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Satin_Alma_Faturalari_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year} yılı satın alma faturaları dışarı aktarıldı`);
      return true;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at exportPurchaseInvoice: " + backendErr);
      return false;
    }
  },
  exportSalesInvoice: async (year) => {
    try {
      const response = await axiosInstance.get("/export/sales-invoices", {
        params: { year },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Satis_Faturalari_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year} yılı satış faturaları dışarı aktarıldı`);
      return true;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at exportSalesInvoice: " + backendErr);
      return false;
    }
  },
}));
