import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useVoucher = create((set) => ({
  vouchers: [],
  loading: false,

  transferAllBalances: async (targetYear, schemaName) => {
    set({ loading: true });
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getOpeningVoucherByYear: async (customerId, date, schemaName) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/voucher/get-by-year", {
        params: { customerId, date, schemaName },
      });
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getAllOpeningVoucherByYear: async (date, schemaName) => {
    set({ loading: true, vouchers: [] });
    try {
      const res = await axiosInstance.get("/voucher/get-all-by-year", {
        params: { date, schemaName },
      });
      set({ vouchers: res.data });
    } catch (error) {
      set({ vouchers: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
