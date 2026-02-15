import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCompany = create((set, get) => ({
  loading: false,
  companies: [],

  getAllCompanies: async () => {
    set({ loading: true, companies: [] });
    try {
      const res = await axiosInstance.get("/company/find-all");
      set({ companies: res.data });
    } catch (error) {
      set({ companies: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addCompany: async (companyData) => {
    set({ loading: true });
    try {
      await axiosInstance.post("/company/create", companyData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      await get().getAllCompanies();
      toast.success("Şirket oluşturuldu");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addYearToCompany: async (companyId, year) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/company/create-year", null, {
        params: { companyId, year },
      });
      await get().getAllCompanies();
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getAllYearByCompanyId: async (companyId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/company/get-all-year", {
        params: { companyId },
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteYear: async (companyId, year) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.delete("/company/delete-year", {
        params: { companyId, year },
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
