import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMaterialPriceHistory = create((set) => ({
  history: [],
  loading: false,

  getHistoryByAllYear: async (materialId, schemaName, invoiceType) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-all-year/${materialId}`,
        {
          params: { schemaName, invoiceType },
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

  getHistoryByYear: async (materialId, invoiceType, schemaName, year) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-year/${materialId}`,
        {
          params: { invoiceType, schemaName, year },
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
    schemaName,
    year,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-year/${customerId}/${materialId}`,
        {
          params: { invoiceType, schemaName, year },
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
    schemaName,
    invoiceType,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-customer-all-year/${customerId}/${materialId}`,
        {
          params: { schemaName, invoiceType },
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
