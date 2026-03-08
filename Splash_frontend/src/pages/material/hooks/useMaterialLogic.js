import { useEffect, useState, useRef, useMemo } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";
import toast from "react-hot-toast";
import { useTenant } from "../../../context/TenantContext.jsx";

export const useMaterialLogic = () => {
  const {
    addMaterial,
    materials,
    getMaterials,
    updateMaterials,
    loading: materialsLoading,
    deleteMaterial,
    setArchived,
  } = useMaterial();
  const { tenant } = useTenant();

  const formRef = useRef(null);
  const [form, setForm] = useState({ code: "", comment: "", unit: "KG" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [menuItemId, setMenuItemId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [archiveAction, setArchiveAction] = useState("archive");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenu && !e.target.closest(".context-menu-container")) {
        setContextMenu(null);
      }
      if (!e.target.closest(".material-card")) {
        setMenuItemId(null);
      }
    };
    document.addEventListener("mousedown", handleGlobalClick);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [contextMenu]);

  useEffect(() => {
    setMenuItemId(null);
    setSelectedIds([]);
    setSelectionMode(false);
  }, [showArchived]);

  useEffect(() => {
    if (editId || deleteConfirmId || archiveConfirmOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editId, deleteConfirmId, archiveConfirmOpen]);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        await getMaterials();
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
  }, [tenant]);

  const initialForm = {
    code: "",
    comment: "",
    unit: "KG",
    purchasePrice: 0,
    purchaseCurrency: "TRY",
    salesPrice: 0,
    salesCurrency: "TRY",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        purchasePrice: Number(parseNumber(String(form.purchasePrice))) || 0,
        salesPrice: Number(parseNumber(String(form.salesPrice))) || 0,
      };
      if (editId) {
        setEditId(null);
        setIsOpen(false);
        setForm(initialForm);
        await updateMaterials(editId, payload, tenant);
      } else {
        await addMaterial(payload, tenant);
        setIsOpen(false);
        setForm(initialForm);
      }

      await getMaterials();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setIsOpen(true);
    setForm({
      code: item.code || "",
      comment: item.comment || "",
      unit: item.unit || "KG",
      purchasePrice: item.purchasePrice ? formatNumber(item.purchasePrice) : "",
      purchaseCurrency: item.purchaseCurrency || "TRY",
      salesPrice: item.salesPrice ? formatNumber(item.salesPrice) : "",
      salesCurrency: item.salesCurrency || "TRY",
    });
  };

  const filteredMaterials = useMemo(() => {
    return (Array.isArray(materials) ? materials : [])
      .filter((item) => (showArchived ? item.archived : !item.archived))
      .filter((item) => {
        const searchTerm = search.toLocaleLowerCase("tr-TR");

        return (
          (item?.code || "").toLocaleLowerCase("tr-TR").includes(searchTerm) ||
          (item?.comment || "").toLocaleLowerCase("tr-TR").includes(searchTerm)
        );
      });
  }, [materials, showArchived, search]);

  const handleBulkArchive = async () => {
    const archivedValue = archiveAction === "archive";
    setArchiveConfirmOpen(false);
    setSelectedIds([]);
    setSelectionMode(false);
    try {
      await setArchived(selectedIds, archivedValue, tenant);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleArchive = async () => {
    const archivedValue = archiveAction === "archive";
    setArchiveConfirmOpen(null);
    setMenuItemId(null);
    try {
      await setArchived(menuItemId, archivedValue, tenant);
      setArchiveConfirmOpen(false);
      setMenuItemId(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
    setIsOpen(false);
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectionMode) {
      setMenuItemId(item.id);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id, tenant);
      setMenuItemId(null);
      setConfirmOpen(false);
      setDeleteConfirmId(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
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

  const isLoading = materialsLoading;

  return {
    state: {
      form,
      editId,
      search,
      filteredMaterials,
      isLoading,
      formatNumber,
      isOpen,
      menuItemId,
      confirmOpen,
      contextMenu,
      deleteConfirmId,
      showArchived,
      archiveConfirmOpen,
      archiveAction,
      selectionMode,
      selectedIds,
    },
    refs: { formRef },
    handlers: {
      handleChange,
      handleSubmit,
      handleEdit,
      setSearch,
      handleCancel,
      setIsOpen,
      handleDelete,
      setMenuItemId,
      setConfirmOpen,
      setContextMenu,
      handleContextMenu,
      setDeleteConfirmId,
      setShowArchived,
      setArchiveAction,
      setArchiveConfirmOpen,
      handleArchive,
      setSelectedIds,
      setSelectionMode,
      toggleSelectId,
      handleBulkArchive,
    },
  };
};
