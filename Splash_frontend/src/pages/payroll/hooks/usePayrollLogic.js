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
    payrollTotalPages,
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
  const [sortOrder, setSortOrder] = useState("desc");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [viewingPayroll, setViewingPayroll] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState(() => {
    return localStorage.getItem("payroll_type") || "cheque_in";
  });

  useEffect(() => {
    localStorage.setItem("payroll_type", type);
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.button === 2) return;
      if (!event.target.closest(".payroll-row")) setSelectedId(null);
      if (contextMenu && !event.target.closest(".context-menu-container"))
        setContextMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  const getInitialDate = (selectedYear) => {
    const currentActualYear = new Date().getFullYear();

    return currentActualYear === Number(year)
      ? new Date().toISOString().slice(0, 10)
      : `${selectedYear}-01-01`;
  };

  const syncFinancialData = async () => {
    try {
      await Promise.all([
        getPayrollByYear(page, PAGE_SIZE, debouncedSearch, year, tenant),
        getAllCustomers(0, 999, false, "", tenant),
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
  const payrollType =
    type === "cheque_in" || type === "cheque_out" ? "ÇEK" : "SENET";

  useEffect(() => {
    if (deleteTarget || editing || viewingPayroll) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteTarget, editing, viewingPayroll]);

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
    const list = payrolls || [];

    return [...list].sort((a, b) => {
      const dateA = new Date(a.transactionDate);
      const dateB = new Date(b.transactionDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [payrolls, sortOrder]);

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
            tenant,
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
            getAllCustomers(0, 999, false, "", tenant),
            getPayrollByYear(page, PAGE_SIZE, debouncedSearch, year, tenant),
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
  }, [year, tenant, page, debouncedSearch]);

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
    try {
      const nextNo = await getFileNo(
        getInitialDate(year),
        type.toUpperCase(),
        tenant,
      );
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

      setEditing(null);
      setIsOpen(false);
      resetForm();
      await syncFinancialData();
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
      amount: item.amount ? formatNumber(item.amount) : "",
      fileNo: item.fileNo || "",
      bankName: item.bankName || "",
      bankBranch: item.bankBranch || "",
      comment: item.comment || "",
    });
  };

  const handleView = (item) => {
    setViewingPayroll(item);
    setContextMenu(null);
  };

  const handleContextMenu = (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedId(item.id);

    const menuWidth = 180;
    const menuHeight = 150;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x -= menuWidth;
    }

    if (y + menuHeight > window.innerHeight) {
      y -= menuHeight;
    }

    setContextMenu({ x, y, item });
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
        await getPayrollByYear(page, PAGE_SIZE, debouncedSearch, year, tenant);
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

    const cleaned = typeof val === "string" ? parseNumber(val) : val;
    const num = parseFloat(cleaned);

    if (isNaN(num)) return "";

    return num.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
      sortOrder,
      isOpen,
      selectedId,
      contextMenu,
      page,
      totalPages: payrollTotalPages,
      viewingPayroll,
    },
    handlers: {
      setType,
      setSortOrder,
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
      setIsOpen,
      setSelectedId,
      handleContextMenu,
      setContextMenu,
      setPage,
      setViewingPayroll,
      handleView,
    },
  };
};
