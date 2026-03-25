import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReceivedCollection = create((set) => ({
  collections: [],
  collectionTotalPages: 0,
  currentPage: 0,
  loading: false,

  addCollection: async (id, receivedCollection, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/receive/add/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Alınan tahsilat eklendi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editCollection: async (id, receivedCollection, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(`/receive/edit/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Tahsilat değiştrildi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteReceivedCollection: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/receive/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Tahsilat başarıyla silindi");
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getReceivedCollectionsByYear: async (
    page = 0,
    size = 20,
    search = "",
    year,
    schemaName,
  ) => {
    set({ loading: true, collections: [] });
    try {
      const res = await axiosInstance.get(`/receive/find-by-year`, {
        params: { page, size, search, year, schemaName },
      });
      set({
        collections: res.data.content,
        collectionTotalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
    } catch (error) {
      set({ collections: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
