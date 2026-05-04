import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthentication = create((set) => ({
  token: localStorage.getItem("token") || null,
  tenant: localStorage.getItem("tenant") || null,
  isAuthenticated: false,
  loading: false,
  authChecked: false,

  login: async (credentials) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/login", credentials);
      const { token, schemaName } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("tenant", schemaName);

      set({
        token: token,
        tenant: schemaName,
        isAuthenticated: true,
        authChecked: true,
      });

      toast.success("Giriş başarılı");
      return response.data.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (signUpData) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post("/auth/save", signUpData);
      const { token, schemaName } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("tenant", schemaName);

      set({
        token: token,
        tenant: schemaName,
        isAuthenticated: true,
        authChecked: true,
      });

      toast.success("Kayıt başarılı");
      return response.data.data;
    } catch (error) {
      set({
        token: null,
        isAuthenticated: false,
        authChecked: true,
      });

      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
    localStorage.removeItem("year");
    localStorage.removeItem("years");
    set({
      token: null,
      isAuthenticated: false,
      authChecked: true,
    });
    toast.success("Çıkış yapıldı");
  },

  authControl: async () => {
    try {
      set({ loading: true });
      await axiosInstance.get("/auth/me");

      set({
        isAuthenticated: true,
        authChecked: true,
      });
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("tenant");
      set({
        token: null,
        tenant: null,
        isAuthenticated: false,
        authChecked: true,
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
