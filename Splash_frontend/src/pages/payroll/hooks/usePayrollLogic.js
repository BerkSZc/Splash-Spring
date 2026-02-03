import { useEffect, useState, useMemo, useRef } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { usePayroll } from "../../../../backend/store/usePayroll.js";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import toast from "react-hot-toast";

export const usePayrollLogic = () => {
  const { customers, getAllCustomers } = useClient();
  const { year } = useYear();
  const { tenant } = useTenant();
  const { payrolls, addCheque, editCheque, deleteCheque, getPayrollByYear } =
    usePayroll();

  const { getFileNo } = useCommonData();

  const formRef = useRef(null);
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
    let isCancelled = false;
    if (!editing && form.transactionDate) {
      const fetchNo = async () => {
        const nextNo = await getFileNo(
          form.transactionDate,
          type.toUpperCase(),
        );
        if (!isCancelled && nextNo) {
          setForm((prev) => ({ ...prev, fileNo: nextNo }));
        }
      };
      fetchNo();
    }
    return () => {
      isCancelled = true;
    };
  }, [type, form.transactionDate, editing, getFileNo]);

  useEffect(() => {
    if (year) {
      getAllCustomers();
      getPayrollByYear(year);
      setForm((prev) => ({ ...prev, transactionDate: getInitialDate(year) }));
    }
  }, [year, getAllCustomers, getPayrollByYear]);

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
    const nextNo = await getFileNo(getInitialDate(year), type.toUpperCase());
    if (nextNo) {
      setForm((prev) => ({ ...prev, fileNo: nextNo }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedYear = new Date(form.transactionDate).getFullYear();

    if (selectedYear !== Number(year)) {
      toast.error("İşlem tarihi mali yıl içinde olmalıdır!");
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
      payrollType: type.includes("cheque") ? "CHEQUE" : "BOND",
      payrollModel: type.includes("_in") ? "INPUT" : "OUTPUT",
    };
    try {
      if (editing) {
        await editCheque(editing.id, payload, tenant);
      } else {
        await addCheque(form.customerId, payload, tenant);
      }
      await getPayrollByYear(year);
      resetForm();
    } catch (error) {
      console.log(error);
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
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openDeleteModel = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteCheque(deleteTarget.id, tenant);
      await getPayrollByYear(year);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  return {
    state: {
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
    refs: { formRef },
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
      formatDate,
    },
  };
};
