import { useEffect } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";

export const useHomeLogic = () => {
  const { companies, getAllCompanies } = useCompany();
  const { purchase, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { sales, getSalesInvoicesByYear } = useSalesInvoice();
  const { customers, getAllCustomers } = useClient();
  const { collections, getReceivedCollectionsByYear } = useReceivedCollection();
  const { payments, getPaymentCollectionsByYear } = usePaymentCompany();

  const { year } = useYear();
  const { tenant } = useTenant();

  useEffect(() => {
    getAllCompanies();
    getAllCustomers();
    getReceivedCollectionsByYear(year);
    getPaymentCollectionsByYear(year);
    getPurchaseInvoiceByYear(year);
    getSalesInvoicesByYear(year);
  }, [year, tenant]);

  // Finansal hesaplamalar
  const totalAlacak = collections.reduce((sum, c) => sum + Number(c.price), 0);
  const totalBorc = payments.reduce((sum, p) => sum + Number(p.price), 0);

  const currentCompany = companies?.find((c) => c.schemaName === tenant);
  const companyDisplayName = currentCompany
    ? currentCompany.name
    : tenant?.toUpperCase();

  return {
    state: {
      purchase,
      sales,
      customers,
      totalAlacak,
      totalBorc,
      companyDisplayName,
      year,
      lastUpdate: new Date().toLocaleString("tr-TR"),
    },
  };
};
