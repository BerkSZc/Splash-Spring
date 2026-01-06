import { useEffect, useState, useMemo } from "react";
import { useClient } from "../../../../backend/store/useClient.js";
import { useYear } from "../../../context/YearContext.jsx";
import { usePayroll } from "../../../../backend/store/usePayroll.js";

export const usePayrollLogic = () => {
  const { customers, getAllCustomers } = useClient();
  const { year } = useYear();
  const { payrolls, addCheque, editCheque, deleteCheque, getPayrollByYear } =
    usePayroll();

  const [type, setType] = useState("cheque_in");
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().slice(0, 10),
    expiredDate: new Date().toISOString().slice(0, 10),
    customerId: "",
    amount: "",
    fileNo: "",
    bankName: "",
    bankBranch: "",
    comment: "",
  });

  useEffect(() => {
    if (year) {
      getAllCustomers();
      getPayrollByYear(year);
    }
  }, [year, getPayrollByYear, getAllCustomers]);

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
      case "note_in":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500",
          label: "Senet Girişi",
          icon: "📝",
        };
      case "note_out":
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

  const filteredList = (payrolls || []).filter((item) => {
    const isCheque = type.includes("cheque");
    const isInput = type.includes("_in");
    const typeMatch = isCheque
      ? item.payrollType === "CHEQUE"
      : item.payrollType === "BOND";
    const modelMatch = isInput
      ? item.payrollModel === "INPUT"
      : item.payrollModel === "OUTPUT";

    return (
      typeMatch &&
      modelMatch &&
      (item.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.fileNo?.toLowerCase().includes(search.toLowerCase()) ||
        item.bankName?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalAmount = filteredList.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const resetForm = () => {
    setForm({
      transactionDate: new Date().toISOString().slice(0, 10),
      expiredDate: new Date().toISOString().slice(0, 10),
      customerId: "",
      amount: "",
      fileNo: "",
      bankName: "",
      bankBranch: "",
      comment: "",
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      payrollType: type.includes("cheque") ? "CHEQUE" : "BOND",
      payrollModel: type.includes("_in") ? "INPUT" : "OUTPUT",
    };

    if (editing) {
      await editCheque(editing.id, payload);
    } else {
      await addCheque(form.customerId, payload);
    }
    resetForm();
    await getPayrollByYear(year);
  };

  const handleEditClick = (item) => {
    setEditing(item);
    setForm({
      transactionDate: item.transactionDate,
      expiredDate: item.expiredDate,
      customerId: item.customer?.id || "",
      amount: item.amount,
      fileNo: item.fileNo,
      bankName: item.bankName,
      bankBranch: item.bankBranch,
      comment: item.comment,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      await deleteCheque(id);
      getPayrollByYear(year);
    }
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
      customers,
      year,
    },
    handlers: {
      setType,
      setSearch,
      setForm,
      handleSubmit,
      resetForm,
      handleEditClick,
      handleDelete,
    },
  };
};
