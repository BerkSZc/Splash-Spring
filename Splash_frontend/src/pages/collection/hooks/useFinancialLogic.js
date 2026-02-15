import { useEffect, useRef, useState } from "react";
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
    addCollection,
    editCollection,
    deleteReceivedCollection,
    getReceivedCollectionsByYear,
    loading: collectionsLoading,
  } = useReceivedCollection();
  const {
    payments,
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

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
          getReceivedCollectionsByYear(year),
          getPaymentCollectionsByYear(year),
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
  }, [year, tenant]);

  const shownList = type === "received" ? collections : payments;

  const filteredList = (Array.isArray(shownList) ? shownList : []).filter(
    (item) => {
      const text = search.toLowerCase();
      return (
        item.customer?.name?.toLowerCase().includes(text) ||
        item.comment?.toLowerCase().includes(text) ||
        item.date?.toLowerCase().includes(text) ||
        String(item?.price || "0").includes(text)
      );
    },
  );

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

    const price = Number(addForm.price);
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
        await getReceivedCollectionsByYear(year);
      } else {
        await addPayment(customerId, payload, tenant);
        await getPaymentCollectionsByYear(year);
      }
      const resetDate = getInitialDate(year);

      const nextNo = await getFileNo(
        resetDate,
        type === "received" ? "COLLECTION" : "PAYMENT",
      );

      await syncFinancialData();

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
    setEditing(item);

    setEditForm({
      date: item.date || "",
      customerId: item?.customer?.id || "",
      price: Number(item?.price) || 0,
      comment: item.comment || "",
      fileNo: item.fileNo || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const customerId = Number(editForm.customerId);
    const selectedCustomer = customers.find((c) => Number(c.id) === customerId);
    const price = Number(editForm.price);
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
        await getReceivedCollectionsByYear(year);
      } else {
        await editPayment(payload.id, payload, tenant);
        await getPaymentCollectionsByYear(year);
      }
      await syncFinancialData();
      setEditing(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (type === "received") {
        await deleteReceivedCollection(deleteTarget.id, tenant);
        await getReceivedCollectionsByYear(year);
      } else {
        await deletePaymentCompany(deleteTarget.id, tenant);
        await getPaymentCollectionsByYear(year);
      }
      await syncFinancialData();
      setDeleteTarget(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const isLoading =
    customersLoading ||
    collectionsLoading ||
    paymentsLoading ||
    commonDataLoading;

  return {
    state: {
      type,
      editing,
      search,
      deleteTarget,
      openMenuId,
      addForm,
      editForm,
      filteredList,
      customers,
      year,
      menuRef,
      isLoading,
    },
    handlers: {
      setType,
      setSearch,
      setDeleteTarget,
      setOpenMenuId,
      setAddForm,
      setEditForm,
      handleAdd,
      handleEdit,
      handleSave,
      handleDelete,
      toggleMenu,
      formatDate,
    },
  };
};
