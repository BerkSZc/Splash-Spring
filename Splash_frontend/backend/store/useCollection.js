import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCollection = create((set) => ({
  collections: [],
  collectionTotalPages: 0,
  currentPage: 0,
  loading: false,

  addCollection: async (id, collection, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(
        `/collection/add/${id}`,
        collection,
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
      toast.success(
        savedCollection.type === "RECEIVED"
          ? "Tahsilat eklendi"
          : "Ödeme gerçekleştirildi",
      );
      return savedCollection;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  editCollection: async (id, collection, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(
        `/collection/edit/${id}`,
        collection,
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
      toast.success("Kasa kaydı güncellendi");
      return updatedCollection;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteCollection: async (id, schemaName, type) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.delete(`/collection/delete/${id}`, {
        params: { schemaName, type },
      });
      const deleteCollection = res.data;
      toast.success(
        deleteCollection.type === "RECEIVED"
          ? "Tahsilat eklendi"
          : "Ödeme gerçekleştirildi",
      );
      set((state) => ({
        collections: state.collections.filter((col) => col.id !== id),
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getCollectionsByYear: async (
    page = 0,
    size = 20,
    search = "",
    year,
    schemaName,
    type = null,
  ) => {
    set({ loading: true, collections: [] });
    try {
      const res = await axiosInstance.get(`/collection/find-by-year`, {
        params: { page, size, search, year, schemaName, type },
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
