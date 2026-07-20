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
      const res = await axiosInstance.post(
        `/receive/add/${id}`,
        receivedCollection,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      const savedCollection = res.data;
      set((state) => ({
        collections: [savedCollection, ...state.collections],
      }));
      toast.success("Alınan tahsilat eklendi");
      return savedCollection;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  editCollection: async (id, receivedCollection, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(
        `/receive/edit/${id}`,
        receivedCollection,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      const updatedCollection = res.data;
      set((state) => ({
        collections: state.collections.map((col) =>
          col.id === id ? updatedCollection : col,
        ),
      }));
      toast.success("Tahsilat değiştirildi");
      return updatedCollection;
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
      set((state) => ({
        collections: state.collections.filter((col) => col.id !== id),
      }));
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
