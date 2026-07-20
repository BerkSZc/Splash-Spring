import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCompany = create((set, get) => ({
  loading: false,
  companies: [],

  getAllCompanies: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/company/find-all");
      set({ companies: res.data });
      return res.data;
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
      const savedCompany = res.data;
      set((state) => ({
        companies: [...state.companies, savedCompany],
      }));
      toast.success("Şirket oluşturuldu");
      return savedCompany;
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
      const savedYear = res.data;

      set((state) => ({
        companies: state.companies.map((company) => {
          if (company.id === companyId) {
            const currentYears = company.years || [];
            const exists = currentYears.some(
              (y) => y.yearValue === savedYear.yearValue,
            );
            return {
              ...company,
              years: exists ? currentYears : [...currentYears, savedYear],
            };
          }
          return company;
        }),
      }));

      return savedYear;
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
      await axiosInstance.delete("/company/delete-year", {
        params: { companyId, year },
      });

      set((state) => ({
        companies: state.companies.map((company) => {
          if (company.id === companyId) {
            return {
              ...company,
              years: (company.years || []).filter((y) => y.yearValue !== year),
            };
          }
          return company;
        }),
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  editCompany: async (compData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put("/company/edit-company", compData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const updatedCompany = res.data;

      set((state) => ({
        companies: state.companies.map((c) =>
          c.schemaName === compData.schemaName
            ? { ...c, ...updatedCompany }
            : c,
        ),
      }));
      toast.success("Şirket bilgileri başarıyla değiştirildi.");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  switchCompany: async (companyId) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(
        `/company/switch-company/${companyId}`,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("tenant", res.data.schemaName);

      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
