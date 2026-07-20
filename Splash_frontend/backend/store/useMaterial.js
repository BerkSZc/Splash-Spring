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
      const res = await axiosInstance.post("/material/add-material", material, {
        params: { schemaName },
      });
      const savedMaterial = res.data;
      const { lastArchivedFilter } = get();

      set((state) => ({
        materials: !lastArchivedFilter
          ? [savedMaterial, ...state.materials]
          : state.materials,
      }));

      toast.success("Malzeme eklendi");
      return savedMaterial;
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
      const res = await axiosInstance.put(
        `/material/update-material/${id}`,
        updateMaterial,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: { schemaName },
        },
      );
      const updatedMaterial = res.data;
      const { lastArchivedFilter } = get();

      set((state) => {
        const shouldRemove = updatedMaterial.archived !== lastArchivedFilter;

        return {
          materials: shouldRemove
            ? state.materials.filter((m) => m.id !== id)
            : state.materials.map((m) => (m.id === id ? updatedMaterial : m)),
        };
      });
      toast.success("Malzeme bilgileri değiştirildi.");
      return updatedMaterial;
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
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
      }));
      toast.success("Malzeme Silindi.");
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

      set((state) => ({
        materials: state.materials.filter((m) => !idList.includes(m.id)),
      }));

      toast.success(
        archived
          ? `${idList.length} malzeme arşivlendi`
          : `${idList.length} malzeme arşivden çıkartıldı`,
      );
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
