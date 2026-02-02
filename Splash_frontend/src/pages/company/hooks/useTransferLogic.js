import { useEffect, useState } from "react";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";
import toast from "react-hot-toast";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useTransferLogic = () => {
  const { year, years, changeYear, addYear } = useYear();
  const { tenant, changeTenant } = useTenant();
  const { addCompany, getAllCompanies, companies, isLoading } = useCompany();
  const { transferAllBalances } = useVoucher();

  const [newYear, setNewYear] = useState("");
  const [shouldTransfer, setShouldTransfer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCompData, setNewCompData] = useState({
    id: "",
    name: "",
    desc: "",
  });

  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  const handleAddYearClick = async () => {
    if (!newYear.trim()) return toast.error("Lütfen yıl girişi yapın!");
    if (years.includes(Number(newYear)))
      return toast.error("Bu mali yıl mevcut");
    setIsModalOpen(true);
  };

  const confirmAndAddYear = async () => {
    setIsModalOpen(false);
    if (Number(year + 1) !== Number(newYear)) {
      return toast.error(
        `Sadece bir sonraki mali yılı (${Number(year + 1)}) ekleyebilirsiniz!`,
      );
    }
    await addYear(Number(newYear));
    await transferAllBalances(Number(newYear));
    setNewYear("");
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
      isModalOpen,
    },
    handlers: {
      changeYear,
      changeTenant,
      setNewYear,
      setNewCompData,
      handleAddYearClick,
      confirmAndAddYear,
      setIsModalOpen,
      handleCreateCompany,
      setShouldTransfer,
    },
  };
};
