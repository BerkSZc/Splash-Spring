import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMaterial = create((set, get) => ({
  materials: [],

  addMaterial: async (material) => {
    try {
      await axiosInstance.post("/material/add-material", material);
      toast.success("Malzeme eklendi");
    } catch (error) {
      toast.error("Error at addMaterial: ", error.message);
    }
  },

  getMaterials: async () => {
    try {
      const res = await axiosInstance.get("/material/list");
      set({ materials: res.data });
    } catch (error) {
      toast.error("Error at getMaterials:", error.message);
    }
  },

  updateMaterials: async (id, updateMaterial) => {
    try {
      await axiosInstance.put(
        `/material/update-material/${id}`,
        updateMaterial,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("malzeme değiştirildi");
      await get().getMaterials();
    } catch (error) {
      toast.error("Error at updateMaterials: ", error.message);
    }
  },
}));
