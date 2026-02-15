import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMaterialPriceHistory = create((set) => ({
  history: [],
  loading: false,

  getHistoryByAllYear: async (materialId, invoiceType) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-all-year/${materialId}`,
        {
          params: { invoiceType },
        },
      );
      set({ history: res.data });
    } catch (error) {
      set({ history: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByYear: async (materialId, invoiceType, year) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-year/${materialId}`,
        {
          params: { invoiceType, year },
        },
      );
      set({ history: res.data });
    } catch (error) {
      set({ history: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByCustomerAndYear: async (
    customerId,
    materialId,
    invoiceType,
    year,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-year/${customerId}/${materialId}`,
        {
          params: { invoiceType, year },
        },
      );
      set({ history: res.data });
    } catch (error) {
      set({ history: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByCustomerAndAllYear: async (
    customerId,
    materialId,
    invoiceType,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-all-year/${customerId}/${materialId}`,
        {
          params: { invoiceType },
        },
      );
      set({ history: res.data });
    } catch (error) {
      set({ history: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
