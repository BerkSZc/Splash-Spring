import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCompany = create((set, get) => ({
  isLoading: false,
  companies: [],

  getAllCompanies: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/company/find-all");
      set({ companies: res.data });
    } catch (error) {
      set({ isLoading: false });
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getAllCompanies: " + backendErr);
    } finally {
      set({ isLoading: false });
    }
  },

  addCompany: async (companyData) => {
    const currentTenant = localStorage.getItem("tenant") || "logo";

    const finalData = {
      id: companyData.id,
      name: companyData.name,
      desc: companyData.desc,
      sourceSchema: currentTenant,
    };
    try {
      await axiosInstance.post("/company/create", finalData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      await get().getAllCompanies();
      toast.success("Şirket oluşturuldu");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at addCompany: " + backendErr);
    }
  },
}));
