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
        }
      );
      toast.success("Firmaya ödeme gerçekleştirildi");
      set((state) => ({ payments: [...state.payments, res.data] }));
    } catch (error) {
      toast.error("Error at addPayment: " + error);
    }
  },

  getPayments: async () => {
    try {
      const res = await axiosInstance.get("/payment/find-all");
      set({ payments: res.data });
    } catch (error) {
      toast.error("Error at getPayments: " + error);
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
      toast.error("Error at editPayment: " + error);
    }
  },
}));
