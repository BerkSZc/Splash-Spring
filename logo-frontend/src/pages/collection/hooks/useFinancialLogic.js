import { useEffect, useRef, useState } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import { useYear } from "../../../context/YearContext.jsx";
import toast from "react-hot-toast";

export const useFinancialLogic = () => {
  const { customers, getAllCustomers } = useClient();
  const { year } = useYear();
  const {
    collections,
    addCollection,
    editCollection,
    deleteReceivedCollection,
    getReceivedCollectionsByYear,
  } = useReceivedCollection();
  const {
    payments,
    addPayment,
    editPayment,
    deletePaymentCompany,
    getPaymentCollectionsByYear,
  } = usePaymentCompany();

  const { getFileNo } = useCommonData();

  const [type, setType] = useState("received"); // received | payment
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const getInitialDate = (selectedYear) => {
    const currentActualYear = new Date().getFullYear();

    return Number(selectedYear) === currentActualYear
      ? new Date().toISOString().slice(0, 10)
      : `${selectedYear}-01-01`;
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
  }, [year]);

  const [editForm, setEditForm] = useState({
    date: "",
    customerId: "",
    price: "",
    comment: "",
    fileNo: "",
  });

  useEffect(() => {
    const updateFileNo = async () => {
      const date = addForm.date;
      if (!date) return;

      const mode = type === "received" ? "COLLECTION" : "PAYMENT";
      const nextNo = await getFileNo(date, mode);

      if (nextNo) {
        setAddForm((prev) => ({ ...prev, fileNo: nextNo }));
      }
    };
    updateFileNo();
  }, [type, addForm.date, getFileNo]);

  useEffect(() => {
    if (!year) return;
    getAllCustomers();
    getReceivedCollectionsByYear(year);
    getPaymentCollectionsByYear(year);
  }, [
    year,
    getAllCustomers,
    getReceivedCollectionsByYear,
    getPaymentCollectionsByYear,
  ]);

  const shownList = type === "received" ? collections : payments;

  const filteredList = (Array.isArray(shownList) ? shownList : []).filter(
    (item) => {
      const text = search.toLowerCase();
      return (
        item.customer?.name?.toLowerCase().includes(text) ||
        item.comment?.toLowerCase().includes(text) ||
        item.date?.toLowerCase().includes(text) ||
        String(item.price).includes(text)
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
    const price = Number(addForm.price);
    const payload = {
      date: addForm.date,
      comment: addForm.comment,
      price: price,
      fileNo: addForm.fileNo,
      customer: { id: customerId },
    };

    try {
      if (type === "received") {
        await addCollection(customerId, payload);
        await getReceivedCollectionsByYear(year);
      } else {
        await addPayment(customerId, payload);
        await getPaymentCollectionsByYear(year);
      }
      const resetDate = getInitialDate(year);

      const nextNo = await getFileNo(
        resetDate,
        type === "received" ? "COLLECTION" : "PAYMENT",
      );

      setAddForm({
        date: getInitialDate(year),
        customerId: "",
        price: "",
        comment: "",
        fileNo: nextNo || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);

    setEditForm({
      date: item.date,
      customerId: item.customer?.id || "",
      price: item.price,
      comment: item.comment,
      fileNo: item.fileNo || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const customerId = Number(editForm.customerId);
    const price = Number(editForm.price);
    const payload = {
      id: editing.id,
      date: editForm.date,
      comment: editForm.comment,
      price: price,
      fileNo: editForm.fileNo,
      customer: { id: customerId },
    };

    const selectedYear = new Date(editForm.date).getFullYear();

    if (selectedYear !== Number(year)) {
      toast.error("Yeni tarih mali yıl aralığında olmalıdır!");
      return;
    }

    if (type === "received") {
      await editCollection(payload.id, payload);
      await getReceivedCollectionsByYear(year);
    } else {
      await editPayment(payload.id, payload);
      await getPaymentCollectionsByYear(year);
    }
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (type === "received") {
      await deleteReceivedCollection(deleteTarget.id);
      await getReceivedCollectionsByYear(year);
    } else {
      await deletePaymentCompany(deleteTarget.id);
      await getPaymentCollectionsByYear(year);
    }
    setDeleteTarget(null);
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
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
      deleteTarget,
      openMenuId,
      addForm,
      editForm,
      filteredList,
      customers,
      year,
      menuRef,
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
