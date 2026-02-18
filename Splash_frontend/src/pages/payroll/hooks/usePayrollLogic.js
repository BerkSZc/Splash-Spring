import { useEffect, useState, useMemo } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { usePayroll } from "../../../../backend/store/usePayroll.js";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import toast from "react-hot-toast";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const usePayrollLogic = () => {
  const { customers, getAllCustomers, loading: customersLoading } = useClient();
  const { year } = useYear();
  const { tenant } = useTenant();
  const { getAllOpeningVoucherByYear } = useVoucher();
  const {
    payrolls,
    addCheque,
    editCheque,
    deleteCheque,
    getPayrollByYear,
    loading: payrollsLoading,
  } = usePayroll();

  const { getFileNo, loading: commonDataLoading } = useCommonData();

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(() => {
    return localStorage.getItem("payroll_type") || "cheque_in";
  });

  useEffect(() => {
    localStorage.setItem("payroll_type", type);
  }, [type]);

  const getInitialDate = (selectedYear) => {
    const currentActualYear = new Date().getFullYear();

    return currentActualYear === Number(year)
      ? new Date().toISOString().slice(0, 10)
      : `${selectedYear}-01-01`;
  };

  const syncFinancialData = async () => {
    try {
      await Promise.all([
        getPayrollByYear(year, tenant),
        getAllCustomers(),
        getAllOpeningVoucherByYear(`${year}-01-01`, tenant),
      ]);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const [form, setForm] = useState({
    transactionDate: getInitialDate(year),
    expiredDate: new Date().toISOString().slice(0, 10),
    customerId: "",
    amount: "",
    fileNo: "",
    bankName: "",
    bankBranch: "",
    comment: "",
  });
  const payrollType = type === "cheque_in" || "cheque_out" ? "ÇEK" : "SENET";

  useEffect(() => {
    if (deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteTarget]);

  const currentTheme = useMemo(() => {
    switch (type) {
      case "cheque_in":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500",
          label: "Çek Girişi",
          icon: "⬇️",
        };
      case "cheque_out":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500",
          label: "Çek Çıkışı",
          icon: "⬆️",
        };
      case "bond_in":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500",
          label: "Senet Girişi",
          icon: "📝",
        };
      case "bond_out":
        return {
          color: "text-purple-400",
          bg: "bg-purple-500",
          label: "Senet Çıkışı",
          icon: "📤",
        };
      default:
        return {
          color: "text-blue-400",
          bg: "bg-blue-500",
          label: "İşlem",
          icon: "💰",
        };
    }
  }, [type]);

  const filteredList = useMemo(() => {
    const isCheque = type.includes("cheque");
    const isInput = type.includes("_in");
    const searchLower = search.toLowerCase();
    return (payrolls || []).filter((item) => {
      const typeMatch = isCheque
        ? item.payrollType === "CHEQUE"
        : item.payrollType === "BOND";
      const modelMatch = isInput
        ? item.payrollModel === "INPUT"
        : item.payrollModel === "OUTPUT";

      return (
        typeMatch &&
        modelMatch &&
        (item.customer?.name?.toLowerCase().includes(searchLower) ||
          item.fileNo?.toLowerCase().includes(searchLower) ||
          item.bankName?.toLowerCase().includes(searchLower))
      );
    });
  }, [payrolls, type, search]);

  const totalAmount = useMemo(
    () => filteredList.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [filteredList],
  );

  useEffect(() => {
    let ignore = false;
    if (!editing && form.transactionDate) {
      const fetchNo = async () => {
        try {
          const nextNo = await getFileNo(
            form.transactionDate,
            type.toUpperCase(),
          );
          if (!ignore && nextNo) {
            setForm((prev) => ({ ...prev, fileNo: nextNo }));
          }
        } catch (error) {
          const backendErr =
            error?.response?.data?.exception?.message || "Bilinmeyen Hata";
          toast.error(backendErr);
        }
      };
      fetchNo();
    }
    return () => {
      ignore = true;
    };
  }, [type, form.transactionDate, editing, tenant]);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        if (year) {
          await Promise.all([
            getAllCustomers(),
            getPayrollByYear(year, tenant),
          ]);
        }
        if (!ignore) {
          setForm((prev) => ({
            ...prev,
            transactionDate: getInitialDate(year),
          }));
        }
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

  const resetForm = async () => {
    setForm({
      transactionDate: getInitialDate(year),
      expiredDate: new Date().toISOString().slice(0, 10),
      customerId: "",
      amount: "",
      fileNo: "",
      bankName: "",
      bankBranch: "",
      comment: "",
    });
    setEditing(null);
    try {
      const nextNo = await getFileNo(getInitialDate(year), type.toUpperCase());
      if (nextNo) {
        setForm((prev) => ({ ...prev, fileNo: nextNo }));
      }
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const selectedYear = new Date(form.transactionDate).getFullYear();

    if (selectedYear !== Number(year)) {
      toast.error("İşlem tarihi mali yıl içinde olmalıdır!");
      return;
    }

    const cleanAmount = parseNumber(form.amount);

    if (!cleanAmount || cleanAmount <= 0) {
      toast.error("Geçerli bir tutar giriniz");
      return;
    }

    if (!form.fileNo) {
      toast.error("Seri No girişi yapın!");
      return;
    }

    if (!form.customerId) {
      toast.error("Müşteri Seçin!");
      return;
    }
    const payload = {
      ...form,
      id: editing?.id,
      amount: Number(cleanAmount),
      customer: {
        id: Number(form.customerId),
      },
      company: form.company,
      payrollType: type.includes("cheque") ? "CHEQUE" : "BOND",
      payrollModel: type.includes("_in") ? "INPUT" : "OUTPUT",
    };
    try {
      if (editing) {
        await editCheque(editing.id, payload, tenant);
      } else {
        await addCheque(form.customerId, payload, tenant);
      }

      await syncFinancialData();
      resetForm();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleEditClick = (item) => {
    setEditing(item);
    setForm({
      transactionDate: item.transactionDate,
      expiredDate: item.expiredDate,
      customerId: item.customer?.id || "",
      amount: item.amount || "",
      fileNo: item.fileNo || "",
      bankName: item.bankName || "",
      bankBranch: item.bankBranch || "",
      comment: item.comment || "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setForm({
      transactionDate: getInitialDate(year),
      expiredDate: new Date().toISOString().slice(0, 10),
      customerId: "",
      amount: "",
      fileNo: "",
      bankName: "",
      bankBranch: "",
      comment: "",
    });
  };

  const openDeleteModel = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget) {
        await deleteCheque(deleteTarget.id, tenant);
        await getPayrollByYear(year);
        setDeleteTarget(null);
      }
      await syncFinancialData();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const formatNumber = (val) => {
    if (!val && val !== 0) return "";
    let stringVal = val.toString().replace(/\./g, "");
    let parts = stringVal.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  };

  const parseNumber = (val) => {
    if (typeof val !== "string") return val;
    return val.replace(/\./g, "").replace(",", ".");
  };

  const isLoading = customersLoading || payrollsLoading || commonDataLoading;

  return {
    state: {
      formatNumber,
      isLoading,
      type,
      editing,
      search,
      form,
      currentTheme,
      filteredList,
      totalAmount,
      deleteTarget,
      customers,
      year,
      payrollType,
    },
    handlers: {
      setType,
      setSearch,
      setForm,
      handleSubmit,
      resetForm,
      setDeleteTarget,
      openDeleteModel,
      handleEditClick,
      confirmDelete,
      closeEdit,
      formatDate,
    },
  };
};
