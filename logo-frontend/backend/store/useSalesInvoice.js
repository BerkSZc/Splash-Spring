import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSalesInvoice = create((set) => ({
  sales: [],

  addSalesInvoice: async (id, newSalesInvoice) => {
    try {
      await axiosInstance.post(`/sales/add/${id}`, newSalesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Fatura eklendi");
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at addSalesInvoice: " + backendErr);
    }
  },

  getAllSalesInvoices: async () => {
    try {
      const res = await axiosInstance.get("/sales/all");
      set({ sales: res.data });
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at getAllSalesInvoices:" + backendErr);
    }
  },

  editSalesInvoice: async (id, salesInvoice) => {
    try {
      await axiosInstance.put(`/sales/update/${id}`, salesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Fatura değiştirildi");
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at editPurchaseInvoice:" + backendErr);
    }
  },

  deleteSalesInvoice: async (id) => {
    try {
      await axiosInstance.delete(`/sales/delete/${id}`);
      toast.success("Fatura başarıyla silindi");
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at deleteSalesInvoice: " + backendErr);
    }
  },

  getSalesInvoicesByYear: async (year) => {
    try {
      await axiosInstance.get(`/sales/find-date/${year}`);
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at getInvoicesByYear: " + backendErr);
    }
  },
}));
