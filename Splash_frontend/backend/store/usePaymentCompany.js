import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePaymentCompany = create((set) => ({
  payments: [],
  loading: false,

  addPayment: async (id, paymentCompany, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/payment/add/${id}`, paymentCompany, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Firmaya ödeme gerçekleştirildi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getPayments: async () => {
    set({ loading: true, payments: [] });
    try {
      const res = await axiosInstance.get("/payment/find-all");
      set({ payments: res.data });
    } catch (error) {
      set({ payments: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  editPayment: async (id, payment, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/payment/edit/${id}`, payment, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Ödeme değiştirildi");
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
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getPaymentCollectionsByYear: async (year) => {
    set({ loading: true, payments: [] });
    try {
      const res = await axiosInstance.get(`/payment/find-year/${year}`);
      set({ payments: res.data });
    } catch (error) {
      set({ sales: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
