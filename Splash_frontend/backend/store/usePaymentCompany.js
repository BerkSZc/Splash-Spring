import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePaymentCompany = create((set) => ({
  payments: [],
  paymentTotalPages: 0,
  currentPage: 0,
  loading: false,

  addPayment: async (id, paymentCompany, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(
        `/payment/add/${id}`,
        paymentCompany,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      const savedCollection = res.data;
      set((state) => ({
        payments: [savedCollection, ...state.payments],
      }));
      toast.success("Firmaya ödeme gerçekleştirildi");
      return savedCollection;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  editPayment: async (id, payment, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/payment/edit/${id}`, payment, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      const updatedCollection = res.data;
      set((state) => ({
        payments: state.payments.map((col) =>
          col.id === id ? updatedCollection : col,
        ),
      }));
      toast.success("Ödeme değiştirildi");
      return updatedCollection;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deletePaymentCompany: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/payment/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Ödeme başarıyla silindi");
      set((state) => ({
        payments: state.payments.filter((col) => col.id !== id),
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getPaymentCollectionsByYear: async (
    page = 0,
    size = 20,
    search = "",
    year,
    schemaName,
  ) => {
    set({ loading: true, payments: [] });
    try {
      const res = await axiosInstance.get(`/payment/find-by-year`, {
        params: { page, size, search, year, schemaName },
      });
      set({
        payments: res.data.content,
        paymentTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
    } catch (error) {
      set({ payments: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
