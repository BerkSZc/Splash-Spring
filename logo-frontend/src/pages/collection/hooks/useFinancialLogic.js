import { useEffect, useState } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useReceivedCollection } from "../../../../backend/store/useReceivedCollection.js";
import { usePaymentCompany } from "../../../../backend/store/usePaymentCompany.js";
import { useYear } from "../../../context/YearContext.jsx";

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

  const [type, setType] = useState("received"); // received | payment
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [addForm, setAddForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    customerId: "",
    price: "",
    comment: "",
  });

  const [editForm, setEditForm] = useState({
    date: "",
    customerId: "",
    price: "",
    comment: "",
  });

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
    }
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    const customerId = Number(addForm.customerId);
    const price = Number(addForm.price);
    const payload = {
      date: addForm.date,
      comment: addForm.comment,
      price: price,
      customer: { id: customerId },
    };

    if (type === "received") {
      await addCollection(customerId, payload);
      await getReceivedCollectionsByYear(year);
    } else {
      await addPayment(customerId, payload);
      await getPaymentCollectionsByYear(year);
    }

    setAddForm({
      date: new Date().toISOString().slice(0, 10),
      customerId: "",
      price: "",
      comment: "",
    });
  };

  const handleEdit = (item) => {
    setEditing(item);
    setEditForm({
      date: item.date,
      customerId: item.customer?.id || "",
      price: item.price,
      comment: item.comment,
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
      customer: { id: customerId },
    };

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
    },
  };
};
