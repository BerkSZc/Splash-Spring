import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const usePayroll = create((set) => ({
  payrolls: [],
  payrollTotalPages: 0,
  currentPage: 0,
  loading: false,

  getPayrollByYear: async (
    page = 0,
    size = 20,
    search = "",
    type,
    year,
    schemaName,
  ) => {
    set({ loading: true, payrolls: [] });
    try {
      const res = await axiosInstance.get(`/payroll/find-by-year`, {
        params: { page, size, search, type, year, schemaName },
      });
      set({
        payrolls: res.data.content,
        payrollTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
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
      const res = await axiosInstance.post(`/payroll/add/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      const savedPayroll = res.data;
      set((state) => ({
        payrolls: [savedPayroll, ...state.payrolls],
      }));
      toast.success("Bordro başarıyla eklendi");
      return savedPayroll;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editCheque: async (id, newPayroll, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/payroll/edit/${id}`, newPayroll, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          schemaName,
        },
      });
      const updatedPayroll = res.data;
      set((state) => ({
        payrolls: state.payrolls.map((payroll) =>
          payroll.id === id ? updatedPayroll : payroll,
        ),
      }));
      toast.success("Bordro değiştirildi");
      return updatedPayroll;
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
      set((state) => ({
        payrolls: state.payrolls.filter((payroll) => payroll.id !== id),
      }));
      toast.success("Bordro başarıyla silindi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
