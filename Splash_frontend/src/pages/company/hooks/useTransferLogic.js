import { useEffect, useState } from "react";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";
import toast from "react-hot-toast";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useTransferLogic = () => {
  const { year, years, changeYear, addYear, removeYear } = useYear();
  const { tenant, changeTenant } = useTenant();
  const { addCompany, getAllCompanies, companies, isLoading } = useCompany();
  const { transferAllBalances } = useVoucher();

  const [newYear, setNewYear] = useState("");
  const [shouldTransfer, setShouldTransfer] = useState(false);

  const [newCompData, setNewCompData] = useState({
    id: "",
    name: "",
    desc: "",
  });

  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  const handleAddYear = async () => {
    const targetYear = Number(newYear);

    if (newYear.trim() && !years.includes(Number(newYear))) {
      await addYear(Number(newYear));

      if (shouldTransfer && targetYear - year === 1) {
        await transferAllBalances(targetYear);
      }
      setNewYear("");
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompData.id || !newCompData.name)
      return toast.error("Lütfen şirket kodu ve adını doldurun");

    const currentTenant = localStorage.getItem("tenant");
    const source =
      currentTenant && currentTenant !== "undefined" ? currentTenant : "logo";

    try {
      await addCompany({ ...newCompData, sourceSchema: source });
      setNewCompData({ id: "", name: "", desc: "" });
      getAllCompanies();
    } catch (error) {
      toast.error("Şirket oluşturulamadı");
    }
  };

  return {
    state: {
      year,
      years,
      tenant,
      companies,
      isLoading,
      newYear,
      newCompData,
      shouldTransfer,
    },
    handlers: {
      changeYear,
      removeYear,
      changeTenant,
      setNewYear,
      setNewCompData,
      handleAddYear,
      handleCreateCompany,
      setShouldTransfer,
    },
  };
};
