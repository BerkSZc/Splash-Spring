import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSendMail = create((set) => ({
  loading: false,

  sendMail: async (mails) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/mail/send", mails);
      toast.success("E-posta başarıyla gönderildi!");
      return res.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getLastMailLog: async () => {
    try {
      const res = await axiosInstance.get("/mail/last-log");
      return res.data?.data || res.data;
    } catch (error) {
      console.error("Son mail logu alınamadı:", error);
      return null;
    }
  },
}));
