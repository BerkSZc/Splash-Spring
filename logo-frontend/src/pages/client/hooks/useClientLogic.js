import { useEffect, useState, useRef } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { useYear } from "../../../context/YearContext.jsx";
import { accountStatementHelper } from "../utils/accountStatementHelper.js";
import { usePayroll } from "../../../../backend/store/usePayroll.js";

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
    openingBalance: 0,
    address: "",
    country: "",
    local: "",
    district: "",
    vdNo: "",
  });

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);

  useEffect(() => {
    if (selectedCustomerForStatement && year) {
      const data = accountStatementHelper(
        selectedCustomerForStatement,
        sales,
        purchase,
        payments,
        collections,
        payrolls,
        year
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
    setSelectedCustomerForStatement(customer);
    setOpenMenuId(null);
    await Promise.all([
      getSalesInvoicesByYear(year),
      getPurchaseInvoiceByYear(year),
      getPaymentCollectionsByYear(year),
      getReceivedCollectionsByYear(year),
      getPayrollByYear(year),
    ]);
    setShowPrintModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!editClient) payload.balance = form.openingBalance;
    if (editClient) {
      updateCustomer(editClient.id, form);
      setEditClient(null);
    } else {
      addCustomer(form);
    }
    setForm({
      name: "",
      openingBalance: 0,
      balance: 0,
      address: "",
      country: "",
      local: "",
      district: "",
      vdNo: "",
    });
  };

  const handleEdit = (customer) => {
    if (customer.archived) return;

    setOpenMenuId(null);

    setEditClient(customer);
    setForm({
      name: customer.name || "",
      balance: customer.balance || "",
      openingBalance: customer.openingBalance || "",
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
      openingBalance: 0,
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
