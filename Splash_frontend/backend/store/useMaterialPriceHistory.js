import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMaterialPriceHistory = create((set) => ({
  history: [],
  totalPages: 0,
  totalElements: 0,
  loading: false,

  getHistoryByAllYear: async (
    page = 0,
    size = 20,
    search = "",
    materialId,
    schemaName,
    invoiceType,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-all-year/${materialId}`,
        {
          params: { page, size, search, schemaName, invoiceType },
        },
      );
      set({
        history: res.data.content || [],
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0,
      });
    } catch (error) {
      set({ history: [], totalPages: 0, totalElements: 0 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByYear: async (
    page = 0,
    size = 20,
    search = "",
    materialId,
    invoiceType,
    schemaName,
    year,
  ) => {
    set({ loading: true, history: [] });
    try {
      const res = await axiosInstance.get(
        `/history/find-by-year/${materialId}`,
        {
          params: { page, size, search, invoiceType, schemaName, year },
        },
      );
      set({
        history: res.data.content || [],
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0,
      });
    } catch (error) {
      set({ history: [], totalPages: 0, totalElements: 0 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByCustomerAndYear: async (
    page = 0,
    size = 20,
    search = "",
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
          params: { page, size, search, invoiceType, schemaName, year },
        },
      );
      set({
        history: res.data.content || [],
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0,
      });
    } catch (error) {
      set({ history: [], totalPages: 0, totalElements: 0 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getHistoryByCustomerAndAllYear: async (
    page = 0,
    size = 20,
    search = "",
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
          params: { page, size, search, schemaName, invoiceType },
        },
      );
      set({
        history: res.data.content || [],
        totalPages: res.data.totalPages || 0,
        totalElements: res.data.totalElements || 0,
      });
    } catch (error) {
      set({ history: [], totalPages: 0, totalElements: 0 });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
