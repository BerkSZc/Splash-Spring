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
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/report/all-reports", {
        params: { year, schemaName },
      });
      set({ reports: res.data });
    } catch (error) {
      toast.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
