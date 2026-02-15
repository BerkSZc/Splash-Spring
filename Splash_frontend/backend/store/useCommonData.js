import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useCommonData = create((set) => ({
  loading: false,
  convertCurrency: async (amount, code, date) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/currency/convert", {
        params: { amount, code, date },
      });
      toast.success("Fiyat dönüştürüldü");
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getDailyRates: async (currencyDate) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/currency/today-rates", {
        params: { currencyDate },
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getFileNo: async (date, type) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/currency/file-no`, {
        params: { date, type },
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
