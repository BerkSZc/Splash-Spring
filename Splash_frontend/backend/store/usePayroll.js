import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const usePayroll = create((set) => ({
  payrolls: [],

  getPayrollByYear: async (year) => {
    try {
      set({ payrolls: [] });
      const res = await axiosInstance.get(`/payroll/find-year`, {
        params: { year },
      });
      set({ payrolls: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getPayrollByYear: " + backendErr);
    }
  },

  addCheque: async (id, newPayroll) => {
    try {
      await axiosInstance.post(`payroll/add/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Bordro başarıyla eklendi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  editCheque: async (id, newPayroll) => {
    try {
      await axiosInstance.put(`/payroll/edit/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Bordro değiştirildi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  deleteCheque: async (id) => {
    try {
      await axiosInstance.delete(`/payroll/delete/${id}`);
      toast.success("Bordro başarıyla silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
}));
