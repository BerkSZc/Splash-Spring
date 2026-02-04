import { useEffect, useMemo } from "react";
import { useReport } from "../../../../backend/store/useReport";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";

export const useReportData = () => {
  const { year } = useYear();
  const { tenant } = useTenant();
  const { reports, getFullReport } = useReport();

  useEffect(() => {
    if (tenant) {
      getFullReport(year, tenant);
    }
  }, [year, tenant, getFullReport]);

  const processedData = useMemo(() => {
    const summaryList = reports?.kdvAnalysis || [];

    const totalPurchaseKdv = summaryList.reduce(
      (acc, curr) => acc + (curr.purchaseKdv || 0),
      0,
    );
    const totalSalesKdv = summaryList.reduce(
      (acc, curr) => acc + (curr.salesKdv || 0),
      0,
    );

    return {
      purchases: reports?.purchaseReports || [],
      sales: reports?.salesReports || [],
      monthlySummary: summaryList,
      totalPurchaseKdv,
      totalSalesKdv,
      netKdv: totalSalesKdv - totalPurchaseKdv,
    };
  }, [reports]);

  return { data: processedData, year };
};
