import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSalesInvoice = create((set) => ({
  sales: [],

  addSalesInvoice: async (id, newSalesInvoice, schemaName) => {
    try {
      await axiosInstance.post(`/sales/add/${id}`, newSalesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Fatura eklendi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  getAllSalesInvoices: async () => {
    try {
      const res = await axiosInstance.get("/sales/all");
      set({ sales: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getAllSalesInvoices:" + backendErr);
    }
  },

  editSalesInvoice: async (id, salesInvoice, schemaName) => {
    try {
      await axiosInstance.put(`/sales/update/${id}`, salesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Fatura değiştirildi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  deleteSalesInvoice: async (id, schemaName) => {
    try {
      await axiosInstance.delete(`/sales/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Fatura başarıyla silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  getSalesInvoicesByYear: async (year) => {
    try {
      set({ sales: [] });
      const res = await axiosInstance.get(`/sales/find-year/${year}`);
      set({ sales: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getSalesInvoicesByYear: " + backendErr);
      set({ sales: [] });
    }
  },
}));
