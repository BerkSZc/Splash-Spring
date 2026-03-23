import { useEffect, useState } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import toast from "react-hot-toast";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useFinancialLogic = () => {
  const { customers, getAllCustomers, loading: customersLoading } = useClient();
  const { year } = useYear();
  const { tenant } = useTenant();
  const {
    collections,
    collectionTotalPages,
    addCollection,
    editCollection,
    deleteReceivedCollection,
    getReceivedCollectionsByYear,
    loading: collectionsLoading,
  } = useReceivedCollection();
  const {
    payments,
    paymentTotalPages,
    addPayment,
    editPayment,
    deletePaymentCompany,
    getPaymentCollectionsByYear,
    loading: paymentsLoading,
  } = usePaymentCompany();

  const { getAllOpeningVoucherByYear } = useVoucher();

  const { getFileNo, loading: commonDataLoading } = useCommonData();

  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [page, setPage] = useState(0);
  const [viewingItem, setViewingItem] = useState(null);
  const PAGE_SIZE = 20;
  const [type, setType] = useState(() => {
    return localStorage.getItem("collection_type") || "payment";
  });

  useEffect(() => {
    localStorage.setItem("collection_type", type);
  }, [type]);

  const getInitialDate = (selectedYear) => {
    const currentActualYear = new Date().getFullYear();

    return Number(selectedYear) === currentActualYear
      ? new Date().toISOString().slice(0, 10)
      : `${selectedYear}-01-01`;
  };

  useEffect(() => {
    if (editing || deleteTarget || viewingItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editing, deleteTarget, viewingItem]);

  const syncFinancialData = async () => {
    try {
      await Promise.all([
        getAllCustomers(),
        getAllOpeningVoucherByYear(`${year}-01-01`, tenant),
      ]);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        error.message ||
        "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const [addForm, setAddForm] = useState({
    date: getInitialDate(year),
    customerId: "",
    price: "",
    comment: "",
    fileNo: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.button === 2) return;

      if (!event.target.closest(".financial-row")) {
        setSelectedId(null);
      }

      if (contextMenu && !event.target.closest(".context-menu-container")) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    setAddForm((prev) => ({ ...prev, date: getInitialDate(year) }));
  }, [year, tenant]);

  const [editForm, setEditForm] = useState({
    date: "",
    customerId: "",
    price: "",
    comment: "",
    fileNo: "",
  });

  useEffect(() => {
    let ignore = false;
    const updateFileNo = async () => {
      const date = addForm.date;
      if (!date) return;

      const mode = type === "received" ? "COLLECTION" : "PAYMENT";
      try {
        const nextNo = await getFileNo(date, mode);

        if (!ignore && nextNo && nextNo !== addForm.fileNo) {
          setAddForm((prev) => ({ ...prev, fileNo: nextNo }));
        }
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };
    updateFileNo();
    return () => {
      ignore = true;
    };
  }, [type, year, tenant, addForm.date]);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!year || !tenant) return;
      try {
        await Promise.all([
          getAllCustomers(),
          getReceivedCollectionsByYear(page, PAGE_SIZE, year, tenant),
          getPaymentCollectionsByYear(page, PAGE_SIZE, year, tenant),
        ]);
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
  }, [year, tenant, page]);

  const shownList = type === "received" ? collections : payments;

  const filteredList = (Array.isArray(shownList) ? shownList : [])
    .filter((item) => {
      const text = search.toLocaleLowerCase("tr-TR");
      return (
        item.customer?.name?.toLocaleLowerCase("tr-TR").includes(text) ||
        item.comment?.toLocaleLowerCase("tr-TR").includes(text) ||
        item.date?.toLocaleLowerCase("tr-TR").includes(text) ||
        String(item?.price || "0").includes(text)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleSelectRow = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

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

    setContextMenu({
      x,
      y,
      item,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const selectedYear = new Date(addForm.date).getFullYear();
    if (selectedYear !== Number(year)) {
      toast.error("Mali yıl arasında ekleme yapın");
      return;
    }

    if (!addForm.customerId) {
      toast.error("Müşteri seçin!");
      return;
    }

    const customerId = Number(addForm.customerId);
    const selectedCustomer = customers.find((c) => Number(c.id) === customerId);

    const price = Number(parseNumber(addForm.price));
    const payload = {
      date: addForm.date,
      comment: addForm.comment || "",
      price: price,
      fileNo: addForm.fileNo || "",
      customer: { id: customerId },
      customerName: selectedCustomer?.name || "",
    };

    try {
      if (type === "received") {
        await addCollection(customerId, payload, tenant);
        await getReceivedCollectionsByYear(page, PAGE_SIZE, year, tenant);
      } else {
        await addPayment(customerId, payload, tenant);
        await getPaymentCollectionsByYear(page, PAGE_SIZE, year, tenant);
      }
      const resetDate = getInitialDate(year);

      const nextNo = await getFileNo(
        resetDate,
        type === "received" ? "COLLECTION" : "PAYMENT",
      );

      await syncFinancialData();

      setIsOpen(false);
      setAddForm({
        date: getInitialDate(year),
        customerId: "",
        price: "",
        comment: "",
        fileNo: nextNo || "",
      });
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleEdit = (item) => {
    if (!item) {
      setEditing(null);
      return;
    }
    setEditing(item);

    setEditForm({
      date: item.date || "",
      customerId: item?.customer?.id || "",
      price: formatNumber(item?.price) || "",
      comment: item.comment || "",
      fileNo: item.fileNo || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const cleanPrice = parseFloat(parseNumber(editForm.price));

    const customerId = Number(editForm.customerId);
    const selectedCustomer = customers.find((c) => Number(c.id) === customerId);
    const price = cleanPrice;
    const payload = {
      id: editing.id,
      date: editForm.date || "",
      comment: editForm.comment || "",
      price: price || 0,
      fileNo: editForm.fileNo || "",
      customer: { id: customerId },
      customerName: selectedCustomer?.name || "",
    };

    const selectedYear = new Date(editForm.date).getFullYear();

    if (selectedYear !== Number(year)) {
      toast.error("Yeni tarih mali yıl aralığında olmalıdır!");
      return;
    }
    try {
      if (type === "received") {
        await editCollection(payload.id, payload, tenant);
        setEditing(null);

        await getReceivedCollectionsByYear(page, PAGE_SIZE, year, tenant);
      } else {
        await editPayment(payload.id, payload, tenant);
        setEditing(null);

        await getPaymentCollectionsByYear(page, PAGE_SIZE, year, tenant);
      }
      await syncFinancialData();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleView = (item) => {
    setViewingItem(item);
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (type === "received") {
        await deleteReceivedCollection(deleteTarget.id, tenant);
        setDeleteTarget(null);

        await getReceivedCollectionsByYear(page, PAGE_SIZE, year, tenant);
      } else {
        await deletePaymentCompany(deleteTarget.id, tenant);
        setDeleteTarget(null);

        await getPaymentCollectionsByYear(page, PAGE_SIZE, year, tenant);
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
    if (!val) return "";
    return val.toString().replace(/\./g, "").replace(",", ".");
  };

  const isLoading =
    customersLoading ||
    collectionsLoading ||
    paymentsLoading ||
    commonDataLoading;

  return {
    state: {
      formatNumber,
      parseNumber,
      type,
      sortOrder,
      editing,
      search,
      deleteTarget,
      addForm,
      editForm,
      filteredList,
      customers,
      year,
      isLoading,
      isOpen,
      selectedId,
      contextMenu,
      totalPages:
        type === "received" ? collectionTotalPages : paymentTotalPages,
      page,
      viewingItem,
    },
    handlers: {
      setType,
      setSearch,
      setSortOrder,
      setDeleteTarget,
      setAddForm,
      setEditForm,
      handleAdd,
      handleEdit,
      handleSave,
      handleDelete,
      formatDate,
      setIsOpen,
      setSelectedId,
      handleSelectRow,
      handleContextMenu,
      setContextMenu,
      setPage,
      setViewingItem,
      handleView,
    },
  };
};
