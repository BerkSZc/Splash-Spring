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
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getAllClient:" + backendErr);
    }
  },
  addCustomer: async (customer, year) => {
    try {
      await axiosInstance.post("/customer/add-customer", customer, {
        params: { year },
      });
      toast.success("Musteri eklendi");
      await get().getAllCustomers();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  updateCustomer: async (id, updateCustomer, currentYear) => {
    try {
      await axiosInstance.put(
        `/customer/update-customer/${id}`,
        updateCustomer,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { currentYear },
        },
      );
      toast.success("Müşteri değiştirildi");
      await get().getAllCustomers();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at updateCustomer:" + backendErr);
      throw error;
    }
  },

  setArchived: async (ids, archived) => {
    const idList = Array.isArray(ids) ? ids : [ids];

    try {
      await axiosInstance.post(
        `/customer/archive?archived=${archived}`,
        idList,
      );
      toast.success(
        archived
          ? `${idList.length} müşteri arşivlendi`
          : `${idList.length} müşteri arşivden çıkartıldı`,
      );
      await get().getAllCustomers();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at setArchived: " + backendErr);
    }
  },
}));
