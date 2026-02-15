import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSalesInvoice = create((set) => ({
  sales: [],
  loading: false,

  addSalesInvoice: async (id, newSalesInvoice, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/sales/add/${id}`, newSalesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Fatura eklendi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getAllSalesInvoices: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/sales/all");
      set({ sales: res.data });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editSalesInvoice: async (id, salesInvoice, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/sales/update/${id}`, salesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Fatura değiştirildi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSalesInvoice: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/sales/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Fatura başarıyla silindi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getSalesInvoicesByYear: async (year) => {
    set({ loading: true, sales: [] });
    try {
      const res = await axiosInstance.get(`/sales/find-year/${year}`);
      set({ sales: res.data });
    } catch (error) {
      set({ sales: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
