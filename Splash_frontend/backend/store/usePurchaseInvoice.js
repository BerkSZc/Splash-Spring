import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const usePurchaseInvoice = create((set) => ({
  purchase: [],

  addPurchaseInvoice: async (id, newPurchaseInvoice) => {
    try {
      await axiosInstance.post(`/purchase/add/${id}`, newPurchaseInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Fatura eklendi.");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  getAllPurchaseInvoices: async () => {
    try {
      const res = await axiosInstance.get("/purchase/all");
      set({ purchase: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  editPurchaseInvoice: async (id, purchaseInvoice) => {
    try {
      await axiosInstance.put(`/purchase/update/${id}`, purchaseInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Fatura değiştirildi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  deletePurchaseInvoice: async (id) => {
    try {
      await axiosInstance.delete(`/purchase/delete/${id}`);
      toast.success("Fatura silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  getPurchaseInvoiceByYear: async (year) => {
    try {
      set({ purchase: [] });
      const res = await axiosInstance.get(`/purchase/find-year/${year}`);
      set({ purchase: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getPurchaseInvoiceByYear: " + backendErr);
      set({ purchase: [] });
    }
  },
}));
