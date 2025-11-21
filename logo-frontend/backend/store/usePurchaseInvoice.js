import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const usePurchaseInvoice = create((set) => ({
  purchase: [],

  addPurchaseInvoice: async (id, newPurchaseInvoice) => {
    try {
      const res = await axiosInstance.post(
        `/purchase/add/${id}`,
        newPurchaseInvoice,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Fatura eklendi.", res.data);
    } catch (error) {
      toast.error("Error at addPurchaseInvoice: " + error.message);
    }
  },

  getAllPurchaseInvoices: async () => {
    try {
      const res = await axiosInstance.get("/purchase/all");
      set({ purchase: res.data });
    } catch (error) {
      toast.error("Error at getAllPurchaseInvoice:" + error);
    }
  },

  editPurchaseInvoice: async (id, purchaseInvoice) => {
    try {
      await axiosInstance.put(`/purchase/update/${id}`, purchaseInvoice, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error("Error at editPurchaseInvoice:" + error);
    }
  },
}));
