import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const usePayroll = create((set) => ({
  payrolls: [],
  loading: false,

  getPayrollByYear: async (year, schemaName) => {
    set({ loading: true, payrolls: [] });
    try {
      const res = await axiosInstance.get(`/payroll/find-year`, {
        params: { year, schemaName },
      });
      set({ payrolls: res.data });
    } catch (error) {
      set({ payrolls: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addCheque: async (id, newPayroll, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`payroll/add/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      toast.success("Bordro başarıyla eklendi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editCheque: async (id, newPayroll, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/payroll/edit/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      toast.success("Bordro değiştirildi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteCheque: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/payroll/delete/${id}`, {
        params: {
          schemaName,
        },
      });
      toast.success("Bordro başarıyla silindi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
