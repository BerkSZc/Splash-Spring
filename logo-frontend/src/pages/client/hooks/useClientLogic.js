import { useEffect, useState, useRef } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { useYear } from "../../../context/YearContext.jsx";
import { accountStatementHelper } from "../utils/accountStatementHelper.js";
import { usePayroll } from "../../../../backend/store/usePayroll.js";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useClientLogic = () => {
  const {
    customers,
    getAllCustomers,
    addCustomer,
    updateCustomer,
    setArchived,
  } = useClient();
  const { sales, getSalesInvoicesByYear } = useSalesInvoice();
  const { purchase, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { payments, getPaymentCollectionsByYear } = usePaymentCompany();
  const { collections, getReceivedCollectionsByYear } = useReceivedCollection();
  const { payrolls, getPayrollByYear } = usePayroll();
  const { getAllOpeningVoucherByYear, vouchers } = useVoucher();
  const { year } = useYear();

  const formRef = useRef(null);
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
  });

  useEffect(() => {
    const refreshBalances = async () => {
      if (year) {
        await getAllCustomers();
        const dateString = `${year}-01-01`;
        await getAllOpeningVoucherByYear(dateString);
      }
    };

    refreshBalances();
  }, [year, getAllCustomers, getAllOpeningVoucherByYear]);

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

    const customerVoucher = vouchers?.find(
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

    setSelectedCustomerForStatement(updatedCustomer);
    await Promise.all([
      getSalesInvoicesByYear(year),
      getPurchaseInvoiceByYear(year),
      getPaymentCollectionsByYear(year),
      getReceivedCollectionsByYear(year),
      getPayrollByYear(year),
    ]);
    setShowPrintModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerPayload = {
      name: form.name,
      address: form.address,
      country: form.country,
      yearlyDebit: Number(form.yearlyDebit || 0),
      yearlyCredit: Number(form.yearlyCredit || 0),
      local: form.local,
      district: form.district,
      vdNo: form.vdNo,
    };

    if (editClient) {
      await updateCustomer(editClient.id, customerPayload, year);
      setEditClient(null);
    } else {
      // Yeni kayıt
      await addCustomer(customerPayload, year);
    }

    const dateString = `${year}-01-01`;
    await getAllOpeningVoucherByYear(dateString);

    setForm({
      name: "",
      yearlyDebit: 0,
      yearlyCredit: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const handleEdit = async (customer) => {
    if (customer.archived) return;

    const customerVoucher = vouchers?.find(
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
    });
    formRef.current.scrollIntoView({ behavior: "smooth" });
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
    });
  };

  const handleArchiveToggle = async (customer) => {
    await setArchived(customer.id, !customer.archived);
    setOpenMenuId(null);
  };

  const handleArchiveModalSubmit = async () => {
    const archivedValue = archiveAction === "archive";
    try {
      await setArchived(selectedCustomers, archivedValue);
      setSelectedCustomers([]);
      setShowArchiveModal(false);
      setOpenMenuId(null);
    } catch (error) {
      console.log("Error" + error);
    }
  };

  const filteredCustomers = Array.isArray(customers)
    ? customers
        .filter((c) => {
          if (!search) return true;
          return (c.name || "")
            .toLocaleLowerCase("tr-TR")
            .includes(search.toLocaleLowerCase("tr-TR"));
        })
        .filter((c) => (showArchived ? c.archived : !c.archived))
    : [];

  return {
    state: {
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
    },
    refs: { formRef },
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
