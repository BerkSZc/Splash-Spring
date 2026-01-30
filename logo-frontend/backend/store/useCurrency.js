import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useCurrency = create(() => ({
  convertCurrency: async (amount, code) => {
    try {
      const res = await axiosInstance.get("/currency/convert", {
        params: { amount, code },
      });
      toast.success("Fiyat dönüştürüldü");
      return res.data;
    } catch (error) {
      const backendErr =
        error?.response?.exception?.data?.message || "Kur Hesaplanamadı";
      toast.error("Error at convertCurrency: " + backendErr);
    }
  },
  getDailyRates: async (currencyDate) => {
    try {
      const res = await axiosInstance.get("/currency/today-rates", {
        params: { currencyDate },
      });
      return res.data;
    } catch (error) {
      const backendErr =
        error?.response?.exception?.data?.message || "Günlük Kur bulunamadı";
      toast.error("Error at getDailyRates: " + backendErr);
    }
  },
  getFileNo: async (date, type) => {
    try {
      const res = await axiosInstance.get(`/currency/file-no`, {
        params: { date, type },
      });
      return res.data;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getFileNo: " + backendErr);
      return "";
    }
  },
}));
