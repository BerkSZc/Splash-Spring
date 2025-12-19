import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReceivedCollection = create((set) => ({
  collections: [],

  addCollection: async (id, receivedCollection) => {
    try {
      await axiosInstance.post(`/receive/add/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Alınan tahsilat eklendi");
    } catch (error) {
      toast.error("Error at addCollection: " + error);
    }
  },

  getCollections: async () => {
    try {
      const res = await axiosInstance.get("/receive/find-all");
      set({ collections: res.data });
    } catch (error) {
      toast.error("Error at getCollections: " + error);
    }
  },

  editCollection: async (id, receivedCollection) => {
    try {
      await axiosInstance.put(`/receive/edit/${id}`, receivedCollection, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Tahsilat değiştrildi");
    } catch (error) {
      toast.error("Error at editCollections: " + error);
    }
  },
  deleteReceivedCollection: async (id) => {
    try {
      await axiosInstance.delete(`/receive/delete/${id}`);
      toast.success("Tahsilat başarıyla silindi");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at deleteReceivedCollection: " + backendErr);
    }
  },
}));
