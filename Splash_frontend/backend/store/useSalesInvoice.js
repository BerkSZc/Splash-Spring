import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSalesInvoice = create((set) => ({
  sales: [],
  salesTotalPages: 0,
  currentPage: 0,
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

  getSalesInvoicesByYear: async (
    page = 0,
    size = 20,
    search = "",
    year,
    schemaName,
  ) => {
    set({ loading: true, sales: [] });
    try {
      const res = await axiosInstance.get(`/sales/find-by-year`, {
        params: { page, size, search, year, schemaName },
      });
      set({
        sales: res.data.content,
        salesTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
    } catch (error) {
      set({ sales: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
