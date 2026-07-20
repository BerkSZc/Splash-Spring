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
  selectedYear: new Date().getFullYear(),

  getAllCustomers: async (
    page = 0,
    size = 20,
    archived = false,
    search = "",
    schemaName,
    year = 2025,
  ) => {
    set({
      loading: true,
      lastSearch: search,
      showArchived: archived,
      selectedYear: year,
    });
    try {
      const res = await axiosInstance.get("/customer/list", {
        params: { page, size, archived, search, schemaName, year },
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
      const res = await axiosInstance.post("/customer/add-customer", customer, {
        params: { year, schemaName },
      });

      const savedCustomer = res.data.data || res.data;
      const { showArchived } = get();

      set((state) => ({
        customers: !showArchived
          ? [savedCustomer, ...state.customers]
          : state.customers,
      }));

      toast.success("Musteri eklendi");
      return savedCustomer;
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

      const updatedCustomer = res.data.data || res.data;

      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? updatedCustomer : c,
        ),
      }));

      toast.success("Müşteri değiştirildi");

      return updatedCustomer;
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

      set((state) => ({
        customers: state.customers.filter((c) => !idList.includes(c.id)),
      }));

      toast.success(
        archived
          ? `${idList.length} müşteri arşivlendi`
          : `${idList.length} müşteri arşivden çıkartıldı`,
      );
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
