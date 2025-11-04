import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const usePurchaseInvoice = create((set) => ({
  addPurchaseInvoice: async (id, newPurchaseInvoice) => {
    try {
      const res = await axiosInstance.post(
        `/purchase/add/${id}`,
        newPurchaseInvoice,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
        toast.success("Fatura eklendi.", res.data)
      );
    } catch (error) {
      toast.error("Error at addPurchaseInvoice: ", error.nessage);
    }
  },
}));
