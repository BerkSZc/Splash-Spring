import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReceivedCollection = create((set) => ({
  collections: [],

  addCollection: async (id, receivedCollection, schemaName) => {
    try {
      await axiosInstance.post(`/receive/add/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Alınan tahsilat eklendi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },

  getCollections: async () => {
    try {
      const res = await axiosInstance.get("/receive/find-all");
      set({ collections: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getCollections: " + backendErr);
    }
  },

  editCollection: async (id, receivedCollection, schemaName) => {
    try {
      await axiosInstance.put(`/receive/edit/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
        params: { schemaName },
      });
      toast.success("Tahsilat değiştrildi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  deleteReceivedCollection: async (id, schemaName) => {
    try {
      await axiosInstance.delete(`/receive/delete/${id}`, {
        params: { schemaName },
      });
      toast.success("Tahsilat başarıyla silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  getReceivedCollectionsByYear: async (year) => {
    try {
      set({ collections: [] });
      const res = await axiosInstance.get(`/receive/find-year/${year}`);
      set({ collections: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getReceivedCollectionsByYear: " + backendErr);
      set({ collections: [] });
    }
  },
}));
