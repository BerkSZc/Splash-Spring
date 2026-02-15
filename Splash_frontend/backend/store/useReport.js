import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReport = create((set) => ({
  reports: {
    purchaseReports: [],
    salesReports: [],
    kdvAnalysis: [],
  },
  loading: false,

  getFullReport: async (year, schemaName) => {
    set({ loading: true, reports: [] });
    try {
      const res = await axiosInstance.get("/report/all-reports", {
        params: { year, schemaName },
      });
      set({ reports: res.data });
    } catch (error) {
      set({ reports: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
