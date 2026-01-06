import { useEffect, useMemo, useState } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useYear } from "../../../context/YearContext.jsx";
import toast from "react-hot-toast";
import { useCurrency } from "../../../../backend/store/useCurrency.js";

export const useInvoiceLogic = () => {
  const [mode, setMode] = useState("sales");
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { addSalesInvoice, getSalesInvoicesByYear } = useSalesInvoice();
  const { addPurchaseInvoice, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { convertCurrency } = useCurrency();
  const { year } = useYear();

  const initalItem = {
    materialId: "",
    unitPrice: "",
    quantity: "",
    kdv: 20,
    lineTotal: 0,
  };

  const [salesForm, setSalesForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    fileNo: "",
    customerId: "",
    items: [{ ...initalItem }],
  });

  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    fileNo: "",
    customerId: "",
    items: [{ ...initalItem }],
  });

  useEffect(() => {
    getMaterials();
    getAllCustomers();
  }, [getMaterials, getAllCustomers]);

  const salesCalculation = useMemo(() => {
    const total = salesForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0
    );
    const kdv = salesForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0
    );
    return { total, kdv, grandTotal: total + kdv };
  }, [salesForm.items]);

  const purchaseCalculation = useMemo(() => {
    const total = purchaseForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0
    );
    const kdv = purchaseForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0
    );
    return { total, kdv, grandTotal: total + kdv };
  }, [purchaseForm.items]);

  const handleMaterialSelect = async (formType, index, materialId) => {
    const selectedMaterial = materials.find((m) => m.id === Number(materialId));

    if (!selectedMaterial) return;

    const isSales = formType === "sales";

    const basePrice = isSales
      ? selectedMaterial.salesPrice || 0
      : selectedMaterial.purchasePrice || 0;

    const currency = isSales
      ? selectedMaterial.salesCurrency || "TRY"
      : selectedMaterial.purchaseCurrency || "TRY";

    let finalPrice = 0;

    if (currency !== "TRY") {
      const calculatedPrice = await convertCurrency(basePrice, currency);
      finalPrice = calculatedPrice || basePrice;
    } else {
      finalPrice = basePrice;
    }

    const setter = isSales ? setSalesForm : setPurchaseForm;
    setter((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        materialId: materialId,
        unitPrice: finalPrice || 0,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (formType, index, field, value) => {
    if (field === "materialId") {
      handleMaterialSelect(formType, index, value);
    } else {
      const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
      setter((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, items: newItems };
      });
    }
  };

  const resetForm = () => {
    const initialForm = {
      date: new Date().toISOString().slice(0, 10),
      fileNo: "",
      customerId: "",
      items: [{ ...initalItem }],
    };
    setSalesForm(initialForm);
    setPurchaseForm(initialForm);
  };

  const addItem = (formType) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
    setter((prev) => ({ ...prev, items: [...prev.items, { ...initalItem }] }));
  };

  const removeItem = (formType, index) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;
    setter((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const isSales = mode === "sales";
    const currentForm = isSales ? salesForm : purchaseForm;
    const currentCalc = isSales ? salesCalculation : purchaseCalculation;

    const validItems = currentForm.items.filter(
      (item) => item.materialId !== ""
    );
    if (validItems.length === 0) {
      toast.error("Faturaya en az bir malzeme seçerek eklemelisiniz!");
      return;
    }

    const payload = {
      date: currentForm.date,
      fileNo: currentForm.fileNo,
      kdvToplam: currentCalc.kdv,
      totalPrice: currentCalc.total,
      ...(isSales ? { customer: { id: Number(currentForm.customerId) } } : {}),
      items: currentForm.items.map((i) => {
        const netTutar = Number(i.unitPrice) * Number(i.quantity);
        const satirKdv = (netTutar * Number(i.kdv)) / 100;
        return {
          material: { id: Number(i.materialId) },
          unitPrice: Number(i.unitPrice),
          quantity: Number(i.quantity),
          kdv: Number(i.kdv),
          kdvTutar: satirKdv,
          lineTotal: netTutar + satirKdv,
        };
      }),
    };

    try {
      if (isSales) {
        await addSalesInvoice(Number(currentForm.customerId), payload);
        getSalesInvoicesByYear(year);
      } else {
        await addPurchaseInvoice(Number(currentForm.customerId), payload);
        getPurchaseInvoiceByYear(year);
      }
      resetForm();
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        "Fatura kaydedilirken bir hata oluştu.";
      toast.error(backendErr);
    }
  };

  return {
    state: {
      mode,
      salesForm,
      purchaseForm,
      materials,
      customers,
      salesCalculation,
      purchaseCalculation,
    },
    handlers: {
      setMode,
      setSalesForm,
      setPurchaseForm,
      handleItemChange,
      addItem,
      removeItem,
      submitForm,
    },
  };
};
