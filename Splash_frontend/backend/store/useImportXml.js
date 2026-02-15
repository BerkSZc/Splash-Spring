import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useImportXml = create((set) => ({
  loading: false,

  importPurchaseInvoice: async (file, schemaName) => {
    set({ loading: true });
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
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  importSalesInvoice: async (file, schemaName) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  importMaterials: async (file) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  importCustomers: async (file) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  importCollections: async (file, schemaName) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  importPayrolls: async (file, schemaName) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  importVouchers: async (file, schemaName) => {
    set({ loading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post("/import/vouchers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { schemaName },
      });
      toast.success("Aktarma başarıyla tamamlandı");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
