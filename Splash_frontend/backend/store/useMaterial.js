import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMaterial = create((set, get) => ({
  materials: [],
  loading: false,

  addMaterial: async (material, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post("/material/add-material", material, {
        params: { schemaName },
      });
      toast.success("Malzeme eklendi");
      await get().getMaterials();
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getMaterials: async () => {
    set({ loading: true, materials: [] });
    try {
      const res = await axiosInstance.get("/material/list");
      set({ materials: res.data });
    } catch (error) {
      set({ materials: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateMaterials: async (id, updateMaterial, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.put(
        `/material/update-material/${id}`,
        updateMaterial,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      toast.success("Malzeme bilgileri değiştirildi.");
      await get().getMaterials();
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteMaterial: async (id, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/material/delete-material/${id}`, {
        params: { schemaName },
      });
      toast.success("Malzeme Silindi.");
      await get().getMaterials();
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
      await axiosInstance.post(
        `/material/archive-material?archived=${archived}`,
        idList,
        {
          params: {
            schemaName,
          },
        },
      );
      toast.success(
        archived
          ? `${idList.length} malzeme arşivlendi`
          : `${idList.length} malzeme arşivden çıkartıldı`,
      );
      await get().getMaterials();
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
