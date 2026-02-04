import { useEffect, useState } from "react";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useCompany } from "../../../../backend/store/useCompany.js";
import toast from "react-hot-toast";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useTransferLogic = () => {
  const { year, years, changeYear, addYear, setYears, removeYear } = useYear();
  const { tenant, changeTenant } = useTenant();
  const {
    addCompany,
    getAllCompanies,
    companies,
    isLoading,
    addYearToCompany,
    getAllYearByCompanyId,
    deleteYear,
  } = useCompany();
  const { transferAllBalances } = useVoucher();

  const [newYear, setNewYear] = useState("");
  const [shouldTransfer, setShouldTransfer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmDeleteCheck, setConfirmDeleteCheck] = useState(false);

  const [newCompData, setNewCompData] = useState({
    id: "",
    name: "",
    desc: "",
  });

  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  useEffect(() => {
    const fetchYears = async () => {
      const selectedCompany = companies?.find((c) => c.schemaName === tenant);

      if (selectedCompany?.id) {
        const data = await getAllYearByCompanyId(selectedCompany.id);
        if (data) {
          setYears(data.map((y) => y.yearValue));
        }
      } else {
        setYears();
      }
    };
    fetchYears();
  }, [tenant, companies, getAllYearByCompanyId, setYears]);

  const handleAddYearClick = async () => {
    if (!newYear.trim()) return toast.error("Lütfen yıl girişi yapın!");
    if (years.includes(Number(newYear)))
      return toast.error("Bu mali yıl mevcut");
    if (Number(year) + 1 !== Number(newYear)) {
      return await confirmAndAddYear(false);
    }
    setIsModalOpen(true);
  };

  const confirmAndAddYear = async () => {
    setIsModalOpen(false);
    setConfirmCheck(false);
    const selectedCompany = companies?.find((c) => c.schemaName === tenant);
    if (!selectedCompany) return toast.error("Lütfen Bir şirket seçin");

    if (Number(year) + 1 !== Number(newYear)) {
      await addYearToCompany(selectedCompany.id, Number(newYear));
      await addYear(Number(newYear));
      setNewYear("");
      toast.success("Mali yıl eklendi");
      return;
    }
    try {
      await transferAllBalances(Number(newYear), tenant);
      await addYearToCompany(selectedCompany.id, Number(newYear));
      await addYear(Number(newYear));
      setNewYear("");
    } catch (error) {
      toast.error("İşlem sırasında hata oluştu");
      console.error(error);
    }
  };

  const handleDeleteYear = async (year) => {
    const selectedCompany = companies?.find((c) => c.schemaName === tenant);
    if (!selectedCompany) {
      toast.error("Lütfen bir şirket seçin");
    }
    try {
      await deleteYear(selectedCompany.id, year);
      removeYear(year);
      handleCloseDelete();
      toast.success(`${year} mali yılı ve ilişkili tüm veriler silindi`);
    } catch (error) {
      toast.error("Hata: " + error?.response?.data?.exception?.message);
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
      toast.error("Şirket oluşturulamadı: " + error.response.message);
    }
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
    setConfirmDeleteCheck(false);
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
      confirmCheck,
      deleteTarget,
      confirmDeleteCheck,
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
      handleCloseDelete,
      handleDeleteYear,
      setShouldTransfer,
      setConfirmCheck,
      setDeleteTarget,
      setConfirmDeleteCheck,
    },
  };
};
