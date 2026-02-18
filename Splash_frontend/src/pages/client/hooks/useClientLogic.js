import { useEffect, useState } from "react";
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [statementData, setStatementData] = useState([]);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] =
    useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    balance: 0,
    yearlyDebit: 0,
    yearlyCredit: 0,
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
    code: "",
  });

  useEffect(() => {
    let ignore = false;
    const refreshBalances = async () => {
      if (!year) return;
      const dateString = `${year}-01-01`;

      await Promise.all([
        getAllCustomers(),
        getAllOpeningVoucherByYear(dateString, tenant),
      ]);

      if (ignore) return;
    };
    refreshBalances();
    return () => {
      ignore = true;
    };
  }, [year, tenant]);

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
    const handleCloseModal = (event) => {
      if (openMenuId && !event.target.closest(".action-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleCloseModal);
    return () => document.removeEventListener("mousedown", handleCloseModal);
  }, [openMenuId]);

  useEffect(() => {
    setSelectedCustomers([]);
    setContextMenu(null);
    setOpenMenuId(null);
  }, [showArchived]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOpenStatement = async (customer) => {
    setOpenMenuId(null);

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
        getSalesInvoicesByYear(year),
        getPurchaseInvoiceByYear(year),
        getPaymentCollectionsByYear(year),
        getReceivedCollectionsByYear(year),
        getPayrollByYear(year),
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
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleEdit = async (customer) => {
    if (customer.archived) return;

    const customerVoucher = (Array.isArray(vouchers) ? vouchers : []).find(
      (v) => String(v?.customer?.id) === String(customer?.id),
    );

    setOpenMenuId(null);

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
      await setArchived(customer.id, !customer.archived);
      setOpenMenuId(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleArchiveModalSubmit = async () => {
    const archivedValue = archiveAction === "archive";
    try {
      await setArchived(selectedCustomers, archivedValue);
      setSelectedCustomers([]);
      setShowArchiveModal(false);
      setOpenMenuId(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const filteredCustomers = Array.isArray(customers)
    ? customers
        .filter((c) => {
          if (!c) return false;
          if (!search) return true;
          return (
            (c.name || "")
              .toLocaleLowerCase("tr-TR")
              .includes(search.toLocaleLowerCase("tr-TR")) ||
            (c.code || "")
              .toLocaleLowerCase("tr-TR")
              .includes(search.toLocaleLowerCase("tr-TR"))
          );
        })
        .filter((c) => (showArchived ? c.archived : !c.archived))
    : [];

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
      openMenuId,
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
      setOpenMenuId,
      setSelectedCustomers,
      setShowArchiveModal,
      setContextMenu,
      setArchiveAction,
      setForm,
      setShowPrintModal,
    },
  };
};
