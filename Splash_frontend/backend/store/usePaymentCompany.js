import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePaymentCompany = create((set) => ({
  payments: [],

  addPayment: async (id, paymentCompany) => {
    try {
      const res = await axiosInstance.post(
        `/payment/add/${id}`,
        paymentCompany,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Firmaya ödeme gerçekleştirildi");
      set((state) => ({ payments: [...state.payments, res.data] }));
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  getPayments: async () => {
    try {
      const res = await axiosInstance.get("/payment/find-all");
      set({ payments: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getPayments: " + backendErr);
    }
  },
  editPayment: async (id, payment) => {
    try {
      await axiosInstance.put(`/payment/edit/${id}`, payment, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Ödeme değiştirildi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  deletePaymentCompany: async (id) => {
    try {
      await axiosInstance.delete(`/payment/delete/${id}`);
      toast.success("Ödeme başarıyla silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  getPaymentCollectionsByYear: async (year) => {
    try {
      set({ payments: [] });
      const res = await axiosInstance.get(`/payment/find-year/${year}`);
      set({ payments: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getPaymentCollectionsByYear: " + backendErr);
      set({ sales: [] });
    }
  },
}));
