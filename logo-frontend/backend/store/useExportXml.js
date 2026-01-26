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
      const backendErr = error?.response?.data || "Bilinmeyen hata";
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
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at exportSalesInvoice: " + backendErr);
      return false;
    }
  },
  exportMaterials: async () => {
    try {
      const response = await axiosInstance.get("/export/materials", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Malzemeler.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Malzemeler dışarıya aktarıldı`);
      return true;
    } catch (error) {
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at exportMaterials: " + backendErr);
      return false;
    }
  },
  exportCustomers: async () => {
    try {
      const response = await axiosInstance.get("/export/customers", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Müşteriler.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Müşteriler dışarıya aktarıldı`);
      return true;
    } catch (error) {
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at exportCustomers: " + backendErr);
      return false;
    }
  },
  exportCollections: async (year) => {
    try {
      const response = await axiosInstance.get("/export/collections", {
        params: { year },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Kasa_İşlemleri_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year}'na ait Kasa İşlemleri dışarıya aktarıldı`);
      return true;
    } catch (error) {
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at exportCollections: " + backendErr);
      return false;
    }
  },
  exportPayrolls: async (year) => {
    try {
      const response = await axiosInstance.get("/export/payrolls", {
        params: { year },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bordro_İşlemleri_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year}'na ait Bordro İşlemleri dışarıya aktarıldı`);
      return true;
    } catch (error) {
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at exportPayrolls: " + backendErr);
      return false;
    }
  },
}));
