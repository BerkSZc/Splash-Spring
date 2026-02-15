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
      if (editId) {
        await updateMaterials(editId, form);
        setEditId(null);
      } else {
        await addMaterial(form);
      }
      setForm(initialForm);
      await getMaterials();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      code: item.code || "",
      comment: item.comment || "",
      unit: item.unit || "KG",
      purchasePrice: item.purchasePrice || "",
      purchaseCurrency: item.purchaseCurrency || "TRY",
      salesPrice: item.salesPrice || "",
      salesCurrency: item.salesCurrency || "TRY",
    });
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter(
    (item) =>
      (item?.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.comment || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
  };

  const isLoading = materialsLoading;

  return {
    state: { form, editId, search, filteredMaterials, isLoading },
    refs: { formRef },
    handlers: {
      handleChange,
      handleSubmit,
      handleEdit,
      setSearch,
      handleCancel,
    },
  };
};
