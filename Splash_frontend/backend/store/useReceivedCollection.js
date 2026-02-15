import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReceivedCollection = create((set) => ({
  collections: [],
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

  getCollections: async () => {
    set({ loading: true, collections: [] });
    try {
      const res = await axiosInstance.get("/receive/find-all");
      set({ collections: res.data });
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
  getReceivedCollectionsByYear: async (year) => {
    set({ loading: true, collections: [] });
    try {
      const res = await axiosInstance.get(`/receive/find-year/${year}`);
      set({ collections: res.data });
    } catch (error) {
      set({ collections: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
