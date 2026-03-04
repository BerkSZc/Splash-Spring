import { useEffect, useState, useRef } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";
import toast from "react-hot-toast";
import { useTenant } from "../../../context/TenantContext.jsx";

export const useMaterialLogic = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({ code: "", comment: "", unit: "KG" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const {
    addMaterial,
    materials,
    getMaterials,
    updateMaterials,
    loading: materialsLoading,
  } = useMaterial();
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (editId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        purchasePrice: Number(parseNumber(String(form.purchasePrice))) || 0,
        salesPrice: Number(parseNumber(String(form.salesPrice))) || 0,
      };
      if (editId) {
        await updateMaterials(editId, payload);
        setEditId(null);
      } else {
        await addMaterial(payload);
      }
      setForm(initialForm);
      setIsOpen(false);
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
    setIsOpen(true);
  };

  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter(
    (item) => {
      const searchTerm = search.toLocaleLowerCase("tr-TR");

      return (
        (item?.code || "").toLocaleLowerCase("tr-TR").includes(searchTerm) ||
        (item?.comment || "").toLocaleLowerCase("tr-TR").includes(searchTerm)
      );
    },
  );

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
    setIsOpen(false);
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
    },
    refs: { formRef },
    handlers: {
      handleChange,
      handleSubmit,
      handleEdit,
      setSearch,
      handleCancel,
      setIsOpen,
    },
  };
};
