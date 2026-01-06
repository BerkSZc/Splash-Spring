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
}));
