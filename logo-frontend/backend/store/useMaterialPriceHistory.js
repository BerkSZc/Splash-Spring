import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMaterialPriceHistory = create((set) => ({
  history: [],

  getHistoryByAllYear: async (materialId, invoiceType) => {
    try {
      const res = await axiosInstance.get(
        `/history/find-by-all-year/${materialId}`,
        {
          params: { invoiceType },
        },
      );
      set({ history: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getHistoryByAllYear: " + backendErr);
    }
  },

  getHistoryByYear: async (materialId, invoiceType, year) => {
    try {
      const res = await axiosInstance.get(
        `/history/find-by-year/${materialId}`,
        {
          params: { invoiceType, year },
        },
      );
      set({ history: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getHistoryByYear: " + backendErr);
    }
  },

  getHistoryByCustomerAndYear: async (
    customerId,
    materialId,
    invoiceType,
    year,
  ) => {
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-year/${customerId}/${materialId}`,
        {
          params: { invoiceType, year },
        },
      );
      set({ history: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getHistoryByCustomerAndYear: " + backendErr);
    }
  },

  getHistoryByCustomerAndAllYear: async (
    customerId,
    materialId,
    invoiceType,
  ) => {
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-all-year/${customerId}/${materialId}`,
        {
          params: { invoiceType },
        },
      );
      set({ history: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getHistoryByCustomerAndAllYear: " + backendErr);
    }
  },
}));
