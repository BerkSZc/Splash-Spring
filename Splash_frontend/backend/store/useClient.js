import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useClient = create((set, get) => ({
  customers: [],
  loading: false,

  getAllCustomers: async () => {
    set({ loading: true, customers: [] });
    try {
      const res = await axiosInstance.get("/customer/list");
      set({ customers: res.data.data });
    } catch (error) {
      set({ customers: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addCustomer: async (customer, year, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post("/customer/add-customer", customer, {
        params: { year, schemaName },
      });
      toast.success("Musteri eklendi");
      await get().getAllCustomers();
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCustomer: async (id, updateCustomer, currentYear, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(
        `/customer/update-customer/${id}`,
        updateCustomer,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { currentYear, schemaName },
        },
      );
      toast.success("Müşteri değiştirildi");
      await get().getAllCustomers();
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setArchived: async (ids, archived) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
