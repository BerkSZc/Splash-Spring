import { useEffect, useMemo } from "react";
import { useInvoice } from "../../../../backend/store/useInvoice.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useCollection } from "../../../../backend/store/useCollection.js";
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
  const { invoice, getInvoicesByYear, loading: invoiceLoading } = useInvoice();
  const { customers, getAllCustomers, loading: customersLoading } = useClient();
  const { getCollectionsByYear, loading: collectionsLoading } = useCollection();

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
          getAllCustomers(0, 999, false, "", tenant, year),
          getCollectionsByYear(0, 999, "", year, tenant),
          getInvoicesByYear(0, 999, "", year, tenant),
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
    const sourceList =
      Array.isArray(vouchers) && vouchers.length > 0
        ? vouchers
        : Array.isArray(customers)
          ? customers
          : [];

    const activeItems = sourceList.filter((item) => {
      const isArchived = Boolean(item?.archived ?? item?.customer?.archived);
      return !isArchived;
    });

    return activeItems.reduce(
      (acc, item) => {
        const balance = Number(item?.finalBalance || 0);
        if (balance > 0) {
          acc.totalCredits += balance;
        } else if (balance < 0) {
          acc.totalDebts += Math.abs(balance);
        }

        return acc;
      },
      { totalDebts: 0, totalCredits: 0 },
    );
  }, [vouchers, customers, year]);

  const currentCompany = (Array.isArray(companies) ? companies : []).find(
    (c) => c?.schemaName === tenant,
  );
  const companyDisplayName = currentCompany
    ? currentCompany.name
    : tenant?.toUpperCase();

  const isLoading =
    companiesLoading ||
    invoiceLoading ||
    customersLoading ||
    collectionsLoading ||
    vouchersLoading;

  const purchaseInvoices = Array.isArray(invoice)
    ? invoice.filter((inv) => inv.invoiceType === "PURCHASE")
    : [];

  const salesInvoices = Array.isArray(invoice)
    ? invoice.filter((inv) => inv.invoiceType === "SALES")
    : [];

  return {
    state: {
      isLoading,
      purchase: purchaseInvoices,
      sales: salesInvoices,
      customers: Array.isArray(customers) ? customers : [],
      totalCredits: financialSummary.totalCredits,
      totalDebts: financialSummary.totalDebts,
      netBalance: financialSummary.totalCredits - financialSummary.totalDebts,
      companyDisplayName,
      year: year,
      lastUpdate: new Date().toLocaleString("tr-TR"),
    },
  };
};
