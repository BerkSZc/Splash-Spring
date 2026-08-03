import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useInvoice = create((set) => ({
  invoice: [],
  invoiceTotalPages: 0,
  currentPage: 0,
  loading: false,

  addInvoice: async (id, invoice, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(`/invoice/add/${id}`, invoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      const savedInvoice = res.data;
      set((state) => ({
        invoice: [savedInvoice, ...state.invoice],
      }));
      toast.success("Fatura eklendi.");
      return savedInvoice;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editInvoice: async (id, invoice, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/invoice/update/${id}`, invoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      const updatedInvoice = res.data;
      set((state) => ({
        invoice: state.invoice.map((inv) =>
          inv.id === id ? updatedInvoice : inv,
        ),
      }));

      toast.success("Fatura değiştirildi");
      return updatedInvoice;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteInvoice: async (id, schemaName, type) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/invoice/delete/${id}`, {
        params: { schemaName, type },
      });
      toast.success("Fatura silindi");
      set((state) => ({
        invoice: state.invoice.filter((inv) => inv.id !== id),
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getInvoicesByYear: async (
    page = 0,
    size = 20,
    search,
    year,
    schemaName,
    type = null,
  ) => {
    set({ loading: true, invoice: [] });
    try {
      const res = await axiosInstance.get(`/invoice/find-by-year`, {
        params: { page, size, search, year, schemaName, type },
      });
      set({
        invoice: res.data.content,
        invoiceTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
    } catch (error) {
      set({ invoice: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
