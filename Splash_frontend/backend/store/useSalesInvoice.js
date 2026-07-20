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
      const res = await axiosInstance.post(
        `/sales/add/${id}`,
        newSalesInvoice,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      const savedInvoice = res.data;

      set((state) => ({
        sales: [savedInvoice, ...state.sales],
      }));

      toast.success("Fatura eklendi");
      return savedInvoice;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editSalesInvoice: async (id, salesInvoice, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/sales/update/${id}`, salesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });

      const updatedInvoice = res.data;

      set((state) => ({
        sales: state.sales.map((inv) => (inv.id === id ? updatedInvoice : inv)),
      }));
      toast.success("Fatura değiştirildi");
      return updatedInvoice;
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
      set((state) => ({
        sales: state.sales.filter((inv) => inv.id !== id),
      }));
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
