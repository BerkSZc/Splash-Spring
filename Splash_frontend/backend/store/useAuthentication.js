import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthentication = create((set) => ({
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,

  login: async (user) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/login", user);
      const token = response.data.data.token;

      localStorage.setItem("token", token);

      set({
        token: token,
        isAuthenticated: true,
      });

      toast.success("Giriş başarılı");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at login: " + backendMessage);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (user) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/save", user);
      const token = response.data.data.token;

      localStorage.setItem("token", token);

      set({
        token: token,
        isAuthenticated: true,
      });

      toast.success("Kayıt başarılı");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.exception?.message || "Bilinmeyen hata";

      toast.error("Error at signUp: " + backendMessage);
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({
      token: null,
      isAuthenticated: false,
    });
    toast.success("Çıkış yapıldı");
  },
}));
