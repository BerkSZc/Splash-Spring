import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMaterial = create((set, get) => ({
  materials: [],
  loading: false,

  addMaterial: async (material) => {
    set({ loading: true });
    try {
      await axiosInstance.post("/material/add-material", material);
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

  updateMaterials: async (id, updateMaterial) => {
    set({ loading: true });
    try {
      await axiosInstance.put(
        `/material/update-material/${id}`,
        updateMaterial,
        {
          headers: {
            "Content-Type": "application/json",
          },
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
}));
