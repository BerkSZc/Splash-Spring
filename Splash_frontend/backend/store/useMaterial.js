import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMaterial = create((set, get) => ({
  materials: [],

  addMaterial: async (material) => {
    try {
      await axiosInstance.post("/material/add-material", material);
      toast.success("Malzeme eklendi");
      await get().getMaterials();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
  getMaterials: async () => {
    try {
      const res = await axiosInstance.get("/material/list");
      set({ materials: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getMaterials:", backendErr);
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
        },
      );
      toast.success("malzeme değiştirildi");
      await get().getMaterials();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
      throw error;
    }
  },
}));
