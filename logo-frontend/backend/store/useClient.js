import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useClient = create((set, get) => ({
  customers: [],

  getAllCustomers: async () => {
    try {
      const res = await axiosInstance.get("/customer/list");
      set({ customers: res.data.data });
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at getAllClient:" + backendErr);
    }
  },
  addCustomer: async (customer) => {
    try {
      await axiosInstance.post("/customer/add-customer", customer);
      toast.success("Musteri eklendi");
      await get().getAllCustomers();
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at addCustomer:" + backendErr);
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
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at updateCustomer:" + backendErr);
    }
  },

  setArchived: async (id, archived) => {
    try {
      await axiosInstance.put(`/customer/archive/${id}?archived=${archived}`);
      toast.success(
        archived ? "Müşteri arşivlendi" : "Müşteri arşivden çıkartıldı"
      );
      await get().getAllCustomers();
    } catch (error) {
      const backendErr =
        error.response.data.exception.message || "Bilinmeyen Hata";
      toast.error("Error at setArchived: " + backendErr);
    }
  },
}));
