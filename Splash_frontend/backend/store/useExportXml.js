import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useExportXml = create((set) => ({
  loading: false,

  exportPurchaseInvoice: async (year, schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/purchase-invoices", {
        params: { year, schemaName },
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
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportSalesInvoice: async (year, schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/sales-invoices", {
        params: { year, schemaName },
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
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportMaterials: async (schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/materials", {
        responseType: "blob",
        params: { schemaName },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Malzemeler.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Malzemeler dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportMaterialsPurchasePrice: async (schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        "/export/materials-purchase-price",
        {
          responseType: "blob",
          params: { schemaName },
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Malzemeler_Alış_Fiyat.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Malzeme Alış Fiyatları dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportMaterialsSalesPrice: async (schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(
        "/export/materials-sales-price",
        {
          responseType: "blob",
          params: { schemaName },
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Malzemeler_Satış_Fiyat.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Malzeme Satış Fiyatları dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportCustomers: async (schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/customers", {
        responseType: "blob",
        params: { schemaName },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Müşteriler.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Müşteriler dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportCollections: async (year, schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/collections", {
        params: { year, schemaName },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Kasa_İşlemleri_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year} yılına ait Kasa İşlemleri dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportPayrolls: async (year, schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/payrolls", {
        params: { year, schemaName },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bordro_İşlemleri_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year} yılına ait Bordro İşlemleri dışarıya aktarıldı`);
      return true;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  exportOpeningVouchers: async (year, schemaName) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/export/vouchers", {
        params: { year, schemaName },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Devir_Bakiye_${year}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${year} yılına ait Devir İşlemleri dışarıya aktarıldı`);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
