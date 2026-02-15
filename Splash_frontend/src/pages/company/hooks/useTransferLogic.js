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
    addYearToCompany,
    getAllYearByCompanyId,
    deleteYear,
    loading: companiesLoading,
  } = useCompany();
  const { transferAllBalances, loading: vouchersLoading } = useVoucher();

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
    let ignore = false;
    const fetchData = async () => {
      try {
        await getAllCompanies();
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
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchYears = async () => {
      const selectedCompany = companies?.find((c) => c.schemaName === tenant);
      try {
        if (selectedCompany?.id) {
          const data = await getAllYearByCompanyId(selectedCompany.id);
          if (!ignore) {
            setYears((Array.isArray(data) ? data : []).map((y) => y.yearValue));
          }
        } else {
          setYears();
        }
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };
    fetchYears();
    return () => {
      ignore = true;
    };
  }, [tenant, companies?.length]);

  const handleAddYearClick = async () => {
    if (!newYear.trim()) return toast.error("Lütfen yıl girişi yapın!");
    if ((Array.isArray(years) ? years : []).includes(Number(newYear)))
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

    try {
      if (Number(year) + 1 !== Number(newYear)) {
        await addYearToCompany(selectedCompany.id, Number(newYear));
        await addYear(Number(newYear));
        setNewYear("");
        toast.success("Mali yıl eklendi");
        return;
      }
      await transferAllBalances(Number(newYear), tenant);
      await addYearToCompany(selectedCompany.id, Number(newYear));
      await addYear(Number(newYear));
      setNewYear("");
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleDeleteYear = async (targetYear) => {
    const selectedCompany = companies?.find((c) => c.schemaName === tenant);
    if (!selectedCompany) {
      toast.error("Lütfen bir şirket seçin");
    }
    try {
      await deleteYear(selectedCompany.id, targetYear);
      removeYear(targetYear);
      handleCloseDelete();
      toast.success(`${targetYear} mali yılı ve ilişkili tüm veriler silindi`);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
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
      await getAllCompanies();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleCloseDelete = () => {
    setDeleteTarget(null);
    setConfirmDeleteCheck(false);
  };

  const isLoading = companiesLoading || vouchersLoading;

  return {
    state: {
      year,
      years,
      tenant,
      companies,
      newYear,
      newCompData,
      shouldTransfer,
      isModalOpen,
      confirmCheck,
      deleteTarget,
      confirmDeleteCheck,
      isLoading,
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
