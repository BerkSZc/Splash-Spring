import { useEffect, useMemo, useState } from "react";
import { useReport } from "../../../../backend/store/useReport";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import toast from "react-hot-toast";

export const useReportData = (reportType) => {
  const { year } = useYear();
  const { tenant } = useTenant();
  const {
    reports,
    getFullReport,
    getBalanceReport,
    loading: reportsLoading,
  } = useReport();
  const [showArchived, setShowArchived] = useState(false);
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!tenant || !year || !reportType) return;

      try {
        if (reportType === "kdv_analysis") {
          await getFullReport(year, tenant);
        } else if (reportType === "balance_status") {
          const startOfYear = `${year}-01-01`;
          const end = `${year}-12-31`;
          await getBalanceReport(startOfYear, end, tenant);
        }
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
  }, [year, tenant, reportType]);

  const processedData = useMemo(() => {
    const summaryList = Array.isArray(reports?.kdvAnalysis)
      ? reports.kdvAnalysis
      : [];

    const isBalanceArray = Array.isArray(reports) ? reports : [];

    const filteredBalanceStatus = isBalanceArray
      .filter((item) => {
        const isArchived = Boolean(item.customer?.archived);
        return showArchived ? isArchived : !isArchived;
      })
      .sort((a, b) => {
        const balanceA = Number(a?.finalBalance || 0);
        const balanceB = Number(b?.finalBalance || 0);
        if (sortDirection === "desc") {
          if (balanceA >= 0 && balanceB < 0) return -1;
          if (balanceA < 0 && balanceB >= 0) return 1;

          return Math.abs(balanceB) - Math.abs(balanceA);
        } else {
          if (balanceA < 0 && balanceB >= 0) return -1;
          if (balanceA >= 0 && balanceB < 0) return 1;

          return Math.abs(balanceB) - Math.abs(balanceA);
        }
      });

    const totalPurchaseKdv = summaryList.reduce(
      (acc, curr) => acc + (Number(curr?.purchaseKdv) || 0),
      0,
    );
    const totalSalesKdv = summaryList.reduce(
      (acc, curr) => acc + (Number(curr?.salesKdv) || 0),
      0,
    );

    return {
      purchases: Array.isArray(reports?.purchaseReports)
        ? reports.purchaseReports
        : [],
      sales: Array.isArray(reports?.salesReports) ? reports.salesReports : [],
      balanceStatus: filteredBalanceStatus,
      monthlySummary: Array.isArray(summaryList) ? summaryList : [],
      totalPurchaseKdv,
      totalSalesKdv,
      netKdv: Number(totalSalesKdv || 0) - Number(totalPurchaseKdv || 0),
    };
  }, [reports, showArchived, sortDirection]);

  const isLoading = reportsLoading;

  return {
    data: processedData,
    year,
    isLoading,
    sortDirection,
    showArchived,
    setSortDirection,
    setShowArchived,
  };
};
