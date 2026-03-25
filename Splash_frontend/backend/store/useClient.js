import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useClient = create((set, get) => ({
  customers: [],
  loading: false,
  customerTotalPages: 0,
  currentPage: 0,
  lastSearch: "",
  showArchived: false,

  getAllCustomers: async (
    page = 0,
    size = 20,
    archived = false,
    search = "",
    schemaName,
  ) => {
    set({ loading: true, lastSearch: search, showArchived: archived });
    try {
      const res = await axiosInstance.get("/customer/list", {
        params: { page, size, archived, search, schemaName },
      });
      set({
        customers: res.data.data.content,
        customerTotalPages: res.data.data.totalPages,
        currentPage: res.data.data.number,
      });
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

      const { lastSearch, showArchived } = get();

      await get().getAllCustomers(0, 20, showArchived, lastSearch, schemaName);
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

      const { currentPage, lastSearch, showArchived } = get();

      await get().getAllCustomers(
        currentPage,
        20,
        showArchived,
        lastSearch,
        schemaName,
      );
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setArchived: async (ids, archived, schemaName) => {
    set({ loading: true });
    const idList = Array.isArray(ids) ? ids : [ids];
    try {
      await axiosInstance.post(`/customer/archive`, idList, {
        params: {
          archived,
          schemaName,
        },
      });
      toast.success(
        archived
          ? `${idList.length} müşteri arşivlendi`
          : `${idList.length} müşteri arşivden çıkartıldı`,
      );
      const { currentPage, lastSearch, showArchived } = get();
      await get().getAllCustomers(
        currentPage,
        20,
        showArchived,
        lastSearch,
        schemaName,
      );
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
