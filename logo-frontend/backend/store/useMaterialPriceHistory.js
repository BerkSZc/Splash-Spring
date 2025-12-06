import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useMaterialPriceHistory = create((set) => ({
  history: [],

  getHistoryByType: async (materialId, invoiceType) => {
    try {
      const res = await axiosInstance.get(
        `/history/find-by-type/${materialId}?invoiceType=${invoiceType}`
      );
      set({ history: res.data });
    } catch (error) {
      toast.error("Error at getHistoryByType: " + error);
    }
  },
}));
