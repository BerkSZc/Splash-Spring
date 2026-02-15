import { useEffect, useMemo } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";

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
  const {
    collections,
    getReceivedCollectionsByYear,
    loading: collectionsLoading,
  } = useReceivedCollection();
  const {
    payments,
    getPaymentCollectionsByYear,
    loading: paymentsLoading,
  } = usePaymentCompany();

  const { year } = useYear();
  const { tenant } = useTenant();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!year || !tenant) return;
      try {
        await Promise.all([
          getAllCompanies(),
          getAllCustomers(),
          getReceivedCollectionsByYear(year),
          getPaymentCollectionsByYear(year),
          getPurchaseInvoiceByYear(year),
          getSalesInvoicesByYear(year),
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
    const totalCredits = (Array.isArray(collections) ? collections : []).reduce(
      (sum, c) => sum + Number(c?.price || 0),
      0,
    );
    const totalDebts = (Array.isArray(payments) ? payments : []).reduce(
      (sum, p) => sum + Number(p?.price || 0),
      0,
    );
    return { totalCredits, totalDebts };
  }, [collections, payments]);

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
    paymentsLoading;

  return {
    state: {
      isLoading,
      purchase: Array.isArray(purchase) ? purchase : [],
      sales: Array.isArray(sales) ? sales : [],
      customers: Array.isArray(customers) ? customers : [],
      totalCredits: financialSummary.totalCredits,
      totalDebts: financialSummary.totalDebts,
      companyDisplayName,
      year,
      lastUpdate: new Date().toLocaleString("tr-TR"),
    },
  };
};
