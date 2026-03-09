import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMaterial = create((set, get) => ({
  materials: [],
  totalPages: 0,
  currentPage: 0,
  lastArchivedFilter: false,
  loading: false,

  addMaterial: async (material, schemaName) => {
    set({ loading: true });
    try {
      await axiosInstance.post("/material/add-material", material, {
        params: { schemaName },
      });
      toast.success("Malzeme eklendi");
      const { lastArchivedFilter } = get();
      await get().getMaterials(0, 20, "", lastArchivedFilter, schemaName);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getMaterials: async (
    page = 0,
    size = 20,
    search = "",
    archived = false,
    schemaName,
  ) => {
    set({ loading: true, lastArchivedFilter: archived });
    try {
      const res = await axiosInstance.get(`/material/list`, {
        params: { page, size, search, archived, schemaName },
      });
      set({
        materials: res.data.content,
        totalPages: res.data.totalPages,
        currentPage: res.data.number,
      });
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
      const { lastArchivedFilter } = get();
      await get().getMaterials(0, 20, "", lastArchivedFilter, schemaName);
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
      const { lastArchivedFilter } = get();
      await get().getMaterials(0, 20, "", lastArchivedFilter, schemaName);
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
      const { lastArchivedFilter } = get();
      await get().getMaterials(0, 20, "", lastArchivedFilter, schemaName);
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
