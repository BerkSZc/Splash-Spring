import { useEffect, useMemo } from "react";
import { useReport } from "../../../../backend/store/useReport";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";

export const useReportData = () => {
  const { year } = useYear();
  const { tenant } = useTenant();
  const { reports, getFullReport, loading: reportsLoading } = useReport();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        if (tenant) {
          await getFullReport(year, tenant);
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
  }, [year, tenant]);

  const processedData = useMemo(() => {
    const summaryList = Array.isArray(reports?.kdvAnalysis)
      ? reports.kdvAnalysis
      : [];

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
      monthlySummary: Array.isArray(summaryList) ? summaryList : [],
      totalPurchaseKdv,
      totalSalesKdv,
      netKdv: Number(totalSalesKdv || 0) - Number(totalPurchaseKdv || 0),
    };
  }, [reports]);

  const isLoading = reportsLoading;

  return { data: processedData, year, isLoading };
};
