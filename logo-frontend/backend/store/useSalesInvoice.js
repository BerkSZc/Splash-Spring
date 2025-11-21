import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSalesInvoice = create((set) => ({
  sales: [],

  getAllSalesInvoices: async () => {
    try {
      const res = await axiosInstance.get("/sales/all");
      set({ sales: res.data });
    } catch (error) {
      toast.error("Error at getAllSalesInvoices:" + error);
    }
  },

  editSalesInvoice: async (id, salesInvoice) => {
    try {
      await axiosInstance.put(`/sales/update/${id}`, salesInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error("Error at editPurchaseInvoice:" + error);
    }
  },
}));
