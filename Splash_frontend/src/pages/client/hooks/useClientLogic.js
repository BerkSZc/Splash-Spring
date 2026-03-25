import { useEffect, useMemo, useState } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import { accountStatementHelper } from "../utils/accountStatementHelper.js";
import { usePayroll } from "../../../../backend/store/usePayroll.js";
import { useVoucher } from "../../../../backend/store/useVoucher.js";
import toast from "react-hot-toast";

export const useClientLogic = () => {
  const {
    customers,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    setArchived,
    customerTotalPages,
    loading: customerLoading,
  } = useClient();
  const {
    sales,
    getSalesInvoicesByYear,
    loading: salesLoading,
  } = useSalesInvoice();
  const {
    purchase,
    getPurchaseInvoiceByYear,
    loading: purchaseLoading,
  } = usePurchaseInvoice();
  const {
    payments,
    getPaymentCollectionsByYear,
    loading: paymentsLoading,
  } = usePaymentCompany();
  const {
    collections,
    getReceivedCollectionsByYear,
    loading: collectionLoading,
  } = useReceivedCollection();
  const { payrolls, getPayrollByYear, loading: payrollsLoading } = usePayroll();
  const {
    getAllOpeningVoucherByYear,
    vouchers,
    loading: vouchersLoading,
  } = useVoucher();
  const { year } = useYear();
  const { tenant } = useTenant();

  const [archiveAction, setArchiveAction] = useState("archive");
  const [contextMenu, setContextMenu] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [statementData, setStatementData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] =
    useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [pendingArchiveIds, setPendingArchiveIds] = useState([]);
  const [viewingClient, setViewingClient] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    balance: "",
    yearlyDebit: "",
    yearlyCredit: "",
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
    code: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    const refreshBalances = async () => {
      if (!year) return;
      const dateString = `${year}-01-01`;

      await Promise.all([
        getAllCustomers(page, PAGE_SIZE, showArchived, debouncedSearch, tenant),
        getAllOpeningVoucherByYear(dateString, tenant),
      ]);

      if (ignore) return;
    };
    refreshBalances();
    return () => {
      ignore = true;
    };
  }, [year, tenant, showArchived, debouncedSearch, page]);

  useEffect(() => {
    setSelectedCustomers([]);
    setSelectionMode(false);
    setContextMenu(null);
  }, [showArchived]);

  useEffect(() => {
    if (selectedCustomerForStatement && year) {
      const customerVoucher = vouchers?.find(
        (v) => v?.customer?.id === selectedCustomerForStatement?.id,
      );
      const data = accountStatementHelper(
        selectedCustomerForStatement,
        sales,
        purchase,
        payments,
        collections,
        payrolls,
        year,
        customerVoucher,
      );
      setStatementData(data);
    }
  }, [
    selectedCustomerForStatement,
    sales,
    purchase,
    payments,
    collections,
    payrolls,
    year,
    tenant,
    vouchers,
  ]);

  useEffect(() => {
    if (editClient || showPrintModal || showArchiveModal || viewingClient) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editClient, showPrintModal, showArchiveModal, viewingClient]);

  useEffect(() => {
    const handleCloseModal = (event) => {
      if (!event.target.closest(".client-row")) {
        if (!selectionMode) setSelectedCustomers([]);
      }
      if (contextMenu && !event.target.closest(".context-menu-container")) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleCloseModal);
    return () => document.removeEventListener("mousedown", handleCloseModal);
  }, [contextMenu, selectionMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenStatement = async (customer) => {
    const customerVoucher = (Array.isArray(vouchers) ? vouchers : []).find(
      (v) => v?.customer?.id === customer?.id,
    );
    const updatedCustomer = {
      ...customer,
      openingBalance: customerVoucher
        ? Number(customerVoucher.yearlyDebit) -
          Number(customerVoucher.yearlyCredit)
        : 0,
      finalBalance: customerVoucher ? customerVoucher.finalBalance : 0,
    };
    try {
      setSelectedCustomerForStatement(updatedCustomer);
      await Promise.allSettled([
        getSalesInvoicesByYear(0, 999, "", year, tenant),
        getPurchaseInvoiceByYear(0, 999, "", year, tenant),
        getPaymentCollectionsByYear(0, 999, "", year, tenant),
        getReceivedCollectionsByYear(0, 999, "", year, tenant),
        getPayrollByYear(0, 999, "", year, tenant),
      ]);
      setShowPrintModal(true);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.code) {
      toast.error("Müşteri ismi ve Müşteri kodunu ekleyin!");
      return;
    }

    const cleanDebit = parseNumber(form.yearlyDebit);
    const cleanCredit = parseNumber(form.yearlyCredit);

    const customerPayload = {
      name: form.name || "",
      address: form.address || "",
      country: form.country || "",
      yearlyDebit: Number(cleanDebit || 0),
      yearlyCredit: Number(cleanCredit || 0),
      local: form.local || "",
      district: form.district || "",
      vdNo: form.vdNo || "",
      code: form.code.trim().toUpperCase(),
    };
    try {
      if (editClient) {
        await updateCustomer(editClient.id, customerPayload, year, tenant);
        setEditClient(null);
      } else {
        await addCustomer(customerPayload, year, tenant);
      }

      const dateString = `${year}-01-01`;
      await getAllOpeningVoucherByYear(dateString, tenant);

      setForm({
        name: "",
        yearlyDebit: 0,
        yearlyCredit: 0,
        address: "",
        country: "",
        local: "",
        district: "",
        vdNo: "",
        code: "",
      });
      setIsOpen(false);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleContextMenu = (e, customer) => {
    e.stopPropagation();
    e.preventDefault();

    if (!selectedCustomers.includes(customer.id)) {
      setSelectedCustomers([customer.id]);
    }

    const menuWidth = 230;
    const menuHeight = 190;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x -= menuWidth;
    }

    if (y + menuHeight > window.innerHeight) {
      y -= menuHeight;
    }

    setContextMenu({ x, y, customer });
  };

  const handleEdit = async (customer) => {
    if (customer.archived) return;

    const customerVoucher = (Array.isArray(vouchers) ? vouchers : []).find(
      (v) => String(v?.customer?.id) === String(customer?.id),
    );

    setEditClient(customer);
    setForm({
      name: customer.name || "",
      finalBalance: customerVoucher?.finalBalance || 0,
      yearlyDebit: customerVoucher.yearlyDebit || 0,
      yearlyCredit: customerVoucher.yearlyCredit || 0,
      address: customer.address || "",
      country: customer.country || "",
      local: customer.local || "",
      district: customer.district || "",
      vdNo: customer.vdNo || "",
      code: customer.code || "",
    });
  };

  const handleCancelEdit = () => {
    setEditClient(null);
    setForm({
      name: "",
      balance: 0,
      yearlyDebit: 0,
      yearlyCredit: 0,
      finalBalance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
      code: "",
    });
  };

  const handleArchiveToggle = async (customer) => {
    try {
      await setArchived(customer.id, !customer.archived, tenant);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleView = (customer) => {
    setViewingClient(customer);
    setContextMenu(null);
  };

  const handleArchiveModalSubmit = async (ids) => {
    const archivedValue = archiveAction === "archive";
    try {
      await setArchived(ids, archivedValue, tenant);
      setSelectedCustomers([]);
      setPendingArchiveIds([]);
      setShowArchiveModal(false);
      setSelectionMode(false);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const filteredCustomers = useMemo(() => {
    const baseList = Array.isArray(customers) ? customers : [];

    return [...baseList].sort((a, b) => {
      const voucherA = (Array.isArray(vouchers) ? vouchers : []).find(
        (v) => v?.customer?.id === a?.id,
      );
      const voucherB = (Array.isArray(vouchers) ? vouchers : []).find(
        (v) => v?.customer?.id === b?.id,
      );

      const valA = Number(voucherA?.finalBalance || 0);
      const valB = Number(voucherB?.finalBalance || 0);

      if (sortDirection === "desc") {
        if (valA >= 0 && valB < 0) return -1;
        if (valA < 0 && valB >= 0) return 1;

        return Math.abs(valB) - Math.abs(valA);
      } else {
        if (valA < 0 && valB >= 0) return -1;
        if (valA >= 0 && valB < 0) return 1;

        return Math.abs(valB) - Math.abs(valA);
      }
    });
  }, [customers, search, showArchived, vouchers, sortDirection]);

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === "") return "";

    let stringVal = val.toString();

    if (typeof val !== "number" && stringVal.includes(",")) {
      stringVal = stringVal.replace(/\./g, "");
    } else if (typeof val === "number") {
      stringVal = stringVal.replace(",", "");
    } else {
      stringVal = stringVal.replace(/\./g, "");
    }

    let parts = stringVal.replace(",", ".").split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return parts.length > 1 ? `${parts[0]},${parts[1].slice(0, 2)}` : parts[0];
  };

  const parseNumber = (val) => {
    if (typeof val !== "string") return val;
    return val.replace(/\./g, "").replace(",", ".");
  };

  const isLoading =
    customerLoading ||
    purchaseLoading ||
    salesLoading ||
    collectionLoading ||
    paymentsLoading ||
    payrollsLoading ||
    vouchersLoading;

  return {
    state: {
      formatNumber,
      customers,
      form,
      search,
      showArchived,
      selectedCustomers,
      showArchiveModal,
      editClient,
      statementData,
      selectedCustomerForStatement,
      showPrintModal,
      contextMenu,
      archiveAction,
      filteredCustomers,
      year,
      vouchers,
      isLoading,
      isOpen,
      sortDirection,
      selectionMode,
      pendingArchiveIds,
      viewingClient,
      customerTotalPages,
      page,
    },
    handlers: {
      handleChange,
      handleSubmit,
      handleEdit,
      handleCancelEdit,
      handleOpenStatement,
      handleArchiveToggle,
      handleArchiveModalSubmit,
      setSearch,
      setShowArchived,
      setSelectedCustomers,
      setShowArchiveModal,
      setContextMenu,
      setArchiveAction,
      setForm,
      setShowPrintModal,
      setIsOpen,
      setSortDirection,
      handleContextMenu,
      setSelectionMode,
      setPendingArchiveIds,
      setViewingClient,
      handleView,
      setPage,
    },
  };
};
