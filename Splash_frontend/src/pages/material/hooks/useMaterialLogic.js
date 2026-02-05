import { useEffect, useState, useRef } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";

export const useMaterialLogic = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({ code: "", comment: "", unit: "KG" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const { addMaterial, materials, getMaterials, updateMaterials } =
    useMaterial();

  useEffect(() => {
    getMaterials();
  }, []);

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
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      code: item.code || "",
      comment: item.comment || "",
      unit: item.unit || "KG",
      purchasePrice: item.purchasePrice ?? "",
      purchaseCurrency: item.purchaseCurrency || "TRY",
      salesPrice: item.salesPrice ?? "",
      salesCurrency: item.salesCurrency || "TRY",
    });
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter(
    (item) =>
      item.code?.toLowerCase().includes(search.toLowerCase()) ||
      item.comment?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
  };

  return {
    state: { form, editId, search, filteredMaterials },
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
