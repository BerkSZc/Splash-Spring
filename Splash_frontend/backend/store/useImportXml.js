import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useImportXml = create(() => ({
  importPurchaseInvoice: async (file, schemaName) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post("/import/purchase-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { schemaName },
      });
      toast.success("Aktarma başarıyla tamamlandı");
      return true;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at importPurchaseInvoice: " + backendErr);
      return false;
    }
  },

  importSalesInvoice: async (file, schemaName) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post("/import/sales-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { schemaName },
      });
      toast.success("Aktarma başarıyla tamamlandı");
    } catch (error) {
      const backendErr = error?.response?.data || "Bilinmeyen hata";
      toast.error("Error at importSalesInvoice: " + backendErr);
    }
  },

  importMaterials: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/materials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Aktarma Başarıyla Tamamlandı");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        error.message ||
        "Bilinmeyen hata";
      toast.error("Error at importMaterials: " + backendErr);
    }
  },
  importCustomers: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/customers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Aktarma Başarıyla Tamamlandı");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        error.message ||
        "Bilinmeyen hata";
      toast.error("Error at importCustomers: " + backendErr);
    }
  },
  importCollections: async (file, schemaName) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/collections", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { schemaName },
      });
      toast.success("Aktarma başarıyla tamamlandı");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at importCollections: " + backendErr);
    }
  },

  importPayrolls: async (file, schemaName) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/payrolls", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { schemaName },
      });
      toast.success("Aktarma başarıyla tamamlandı");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at ImportPayrolls: " + backendErr);
    }
  },

  importVouchers: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/vouchers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Aktarma başarıyla tamamlandı");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";
      toast.error("Error at importVouchers: " + backendErr);
    }
  },
}));
