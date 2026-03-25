import { useEffect, useMemo } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";
import { useVoucher } from "../../../../backend/store/useVoucher.js";
import toast from "react-hot-toast";

export const useHomeLogic = () => {
  const {
    companies,
    getAllCompanies,
    loading: companiesLoading,
  } = useCompany();
  const {
    purchase,
    getPurchaseInvoiceByYear,
    loading: purchaseLoading,
  } = usePurchaseInvoice();
  const {
    sales,
    getSalesInvoicesByYear,
    loading: salesLoading,
  } = useSalesInvoice();
  const { customers, getAllCustomers, loading: customersLoading } = useClient();
  const { getReceivedCollectionsByYear, loading: collectionsLoading } =
    useReceivedCollection();
  const { getPaymentCollectionsByYear, loading: paymentsLoading } =
    usePaymentCompany();

  const {
    vouchers,
    getAllOpeningVoucherByYear,
    loading: vouchersLoading,
  } = useVoucher();

  const { year } = useYear();
  const { tenant } = useTenant();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!year || !tenant) return;
      try {
        const dateString = `${year}-01-01`;
        await Promise.all([
          getAllCompanies(),
          getAllCustomers(0, 999, false, "", tenant),
          getReceivedCollectionsByYear(0, 999, "", year, tenant),
          getPaymentCollectionsByYear(0, 999, "", year, tenant),
          getPurchaseInvoiceByYear(0, 999, "", year, tenant),
          getSalesInvoicesByYear(0, 999, "", year, tenant),
          getAllOpeningVoucherByYear(dateString, tenant),
        ]);
        if (ignore) return;
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [year, tenant]);

  // Finansal hesaplamalar
  const financialSummary = useMemo(() => {
    const voucherList = Array.isArray(vouchers) ? vouchers : [];

    const activeVouchers = voucherList.filter(
      (v) => v?.customer?.archived === false,
    );

    return activeVouchers.reduce(
      (acc, v) => {
        const balance = Number(v?.finalBalance || 0);

        if (balance > 0) {
          acc.totalCredits += balance;
        } else if (balance < 0) {
          acc.totalDebts += Math.abs(balance);
        }

        return acc;
      },
      { totalDebts: 0, totalCredits: 0 },
    );
  }, [vouchers]);

  const currentCompany = (Array.isArray(companies) ? companies : []).find(
    (c) => c?.schemaName === tenant,
  );
  const companyDisplayName = currentCompany
    ? currentCompany.name
    : tenant?.toUpperCase();

  const isLoading =
    companiesLoading ||
    purchaseLoading ||
    salesLoading ||
    customersLoading ||
    collectionsLoading ||
    paymentsLoading ||
    vouchersLoading;

  return {
    state: {
      isLoading,
      purchase: Array.isArray(purchase) ? purchase : [],
      sales: Array.isArray(sales) ? sales : [],
      customers: Array.isArray(customers) ? customers : [],
      totalCredits: financialSummary.totalCredits,
      totalDebts: financialSummary.totalDebts,
      netBalance: financialSummary.totalCredits - financialSummary.totalDebts,
      companyDisplayName,
      year,
      lastUpdate: new Date().toLocaleString("tr-TR"),
    },
  };
};
