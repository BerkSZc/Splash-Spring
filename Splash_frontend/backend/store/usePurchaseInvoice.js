import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const usePurchaseInvoice = create((set) => ({
  purchase: [],
  purchaseTotalPages: 0,
  currentPage: 0,
  loading: false,

  addPurchaseInvoice: async (id, newPurchaseInvoice, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/purchase/add/${id}`, newPurchaseInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      toast.success("Fatura eklendi.");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editPurchaseInvoice: async (id, purchaseInvoice, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/purchase/update/${id}`, purchaseInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      toast.success("Fatura değiştirildi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePurchaseInvoice: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/purchase/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Fatura silindi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getPurchaseInvoiceByYear: async (
    page = 0,
    size = 20,
    search,
    year,
    schemaName,
  ) => {
    set({ loading: true, purchase: [] });
    try {
      const res = await axiosInstance.get(`/purchase/find-by-year`, {
        params: { page, size, search, year, schemaName },
      });
      set({
        purchase: res.data.content,
        purchaseTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
    } catch (error) {
      set({ purchase: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
