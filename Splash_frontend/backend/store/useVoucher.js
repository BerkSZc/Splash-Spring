import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useVoucher = create((set) => ({
  vouchers: [],

  transferAllBalances: async (targetYear, schemaName) => {
    try {
      await axiosInstance.post(
        "/voucher/transfer-all",
        {},
        {
          params: { targetYear, schemaName },
        },
      );
      toast.success(
        `${targetYear} yılı tüm cari devirleri tamamlandı ve Yeni Mali Yıl oluşturuldu.`,
      );
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at transferBalance: " + backendErr);
    }
  },
  getOpeningVoucherByYear: async (customerId, date) => {
    try {
      const res = await axiosInstance.get("/voucher/get-by-year", {
        params: { customerId, date },
      });
      return res.data;
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getOpeningVoucherByYear: " + backendErr);
    }
  },
  getAllOpeningVoucherByYear: async (date) => {
    try {
      const res = await axiosInstance.get("/voucher/get-all-by-year", {
        params: { date },
      });
      set({ vouchers: res.data });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error("Error at getAllOpeningVoucherByYear: " + backendErr);
    }
  },
}));
