import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useClient = create((set, get) => ({
  customers: [],

  getAllCustomers: async () => {
    try {
      const res = await axiosInstance.get("/customer/list");
      set({ customers: res.data });
    } catch (error) {
      toast.error("Error at getAllClient:" + error.message);
    }
  },
  addCustomer: async (customer) => {
    try {
      await axiosInstance.post("/customer/add-customer", customer);
      toast.success("Musteri eklendi");
      await get().getAllCustomers();
    } catch (error) {
      toast.error("Error at addCustomer:" + error.message);
    }
  },

  updateCustomer: async (id, updateCustomer) => {
    try {
      await axiosInstance.put(
        `/customer/update-customer/${id}`,
        updateCustomer,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Müşteri değiştirildi");
      await get().getAllCustomers();
    } catch (error) {
      toast.error("Error at updateCustomer:" + error.message);
    }
  },
}));
