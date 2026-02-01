import { useEffect, useMemo, useState } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useYear } from "../../../context/YearContext.jsx";
import toast from "react-hot-toast";
import { useCommonData } from "../../../../backend/store/useCommonData.js";

export const useInvoiceLogic = () => {
  const { materials } = useMaterial();
  const { customers } = useClient();
  const { addSalesInvoice, getSalesInvoicesByYear } = useSalesInvoice();
  const { addPurchaseInvoice, getPurchaseInvoiceByYear } = usePurchaseInvoice();
  const { convertCurrency, getDailyRates, getFileNo } = useCommonData();
  const { year } = useYear();

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("invoice_mode") || "sales";
  });

  useEffect(() => {
    localStorage.setItem("invoice_mode", mode);
  }, [mode]);

  const initalItem = {
    materialId: "",
    unitPrice: "",
    quantity: "",
    kdv: 20,
    kdvTutar: 0,
    lineTotal: 0,
  };

  const getInitialFormState = (selectedYear) => {
    const currentActualDate = new Date();
    const currentActualYear = currentActualDate.getFullYear();

    let startDate;

    if (Number(selectedYear) == currentActualYear) {
      startDate = currentActualDate.toISOString().slice(0, 10);
    } else {
      startDate = `${selectedYear}-01-01`;
    }
    return {
      date: startDate,
      fileNo: "",
      customerId: "",
      usdSellingRate: "",
      eurSellingRate: "",
      items: [{ ...initalItem }],
    };
  };

  useEffect(() => {
    const newState = getInitialFormState(year);
    setSalesForm((prev) => ({ ...prev, date: newState.date }));
    setPurchaseForm((prev) => ({ ...prev, date: newState.date }));
  }, [year]);

  const [salesForm, setSalesForm] = useState(() => getInitialFormState(year));
  const [purchaseForm, setPurchaseForm] = useState(() =>
    getInitialFormState(year),
  );

  const calculateItemsWithRates = (items, rates, materials, mode) => {
    return items.map((item) => {
      const material = materials.find((m) => m.id === Number(item.materialId));
      if (!material) return item;

      const mCurrency =
        mode === "sales" ? material.salesCurrency : material.purchaseCurrency;
      const mPrice =
        mode === "sales" ? material.salesPrice : material.purchasePrice;

      let newPrice = item.unitPrice;
      if (mCurrency === "USD") newPrice = mPrice * (rates.USD || 1);
      else if (mCurrency === "EUR") newPrice = mPrice * (rates.EUR || 1);
      else if (mCurrency === "TRY") newPrice = mPrice;

      return { ...item, unitPrice: newPrice };
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const currentForm = mode === "sales" ? salesForm : purchaseForm;
      const date = currentForm.date;
      if (!date) return;

      const [rates, nextNo] = await Promise.all([
        getDailyRates(date),
        getFileNo(date, mode.toUpperCase()),
      ]);
      if (!isMounted) return;
      const setter = mode === "sales" ? setSalesForm : setPurchaseForm;

      setter((prev) => ({
        ...prev,
        fileNo: nextNo || prev.fileNo,
        usdSellingRate: rates?.USD || prev.usdSellingRate || "",
        eurSellingRate: rates?.EUR || prev.eurSellingRate || "",
        items: rates
          ? calculateItemsWithRates(prev.items, rates, materials, mode)
          : prev.items,
      }));
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [mode, salesForm.date, purchaseForm.date, materials]);

  const salesCalculation = useMemo(() => {
    const total = salesForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0,
    );
    const kdv = salesForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0,
    );
    return { total, kdv, grandTotal: total + kdv };
  }, [salesForm.items]);

  const purchaseCalculation = useMemo(() => {
    const total = purchaseForm.items.reduce(
      (s, i) => s + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0,
    );
    const kdv = purchaseForm.items.reduce(
      (s, i) =>
        s +
        ((Number(i.unitPrice) * Number(i.quantity) || 0) * Number(i.kdv)) / 100,
      0,
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

  // Döviz kurlarını güncelleyen yardımcı fonksiyon
  const handleRateChange = (field, value) => {
    let val = value.replace(/[^0-9.]/g, "");

    if (val.includes(".")) {
      const [intPart, decPart] = val.split(".");
      if (decPart.length > 2) {
        val = `${intPart}.${decPart.slice(0, 2)}`;
      }
    }

    if (val.length === 3 && !val.includes(".")) {
      val = val.slice(0, 2) + "." + val.slice(2);
    }

    if (val.length > 5) return;

    const numericRate = Number(val) || 0;
    const isSales = mode === "sales";
    const setter = isSales ? setSalesForm : setPurchaseForm;

    setter((prev) => {
      const updatedForm = { ...prev, [field]: val };

      const updatedItems = updatedForm.items.map((item) => {
        const material = materials.find(
          (m) => m.id === Number(item.materialId),
        );
        if (material) {
          const isSalesMode = mode === "sales";
          const mCurrency = isSalesMode
            ? material.salesCurrency
            : material.purchaseCurrency;
          const mPrice = isSalesMode
            ? material.salesPrice
            : material.purchasePrice;

          let newUnitPrice = item.unitPrice;

          if (field === "usdSellingRate" && mCurrency === "USD") {
            newUnitPrice = mPrice * numericRate;
          } else if (field === "eurSellingRate" && mCurrency === "EUR") {
            newUnitPrice = mPrice * numericRate;
          }

          const qty = Number(item.quantity) || 0;
          const kdvRate = Number(item.kdv) || 0;
          const lineTotal = newUnitPrice * qty;

          return {
            ...item,
            unitPrice: newUnitPrice,
            lineTotal: lineTotal,
            kdvTutar: (lineTotal * kdvRate) / 100,
          };
        }
        return item;
      });

      return { ...updatedForm, items: updatedItems };
    });
  };

  const resetForm = () => {
    const initialState = getInitialFormState(year);
    setSalesForm(initialState);
    setPurchaseForm(initialState);
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
      (item) => item.materialId !== "",
    );
    if (validItems.length === 0) {
      toast.error("Faturaya en az bir malzeme seçerek eklemelisiniz!");
      return;
    }

    const selectedYear = new Date(currentForm.date).getFullYear();
    if (selectedYear != Number(year)) {
      toast.error(
        `Seçilen tarih ${selectedYear} yılına ait. Lütfen ${year} yılına uygun bir tarih seçin.`,
      );
      return;
    }

    if (!currentForm.customerId) {
      toast.error("Müşteri seçin!");
      return;
    }

    const payload = {
      date: currentForm.date,
      currencyDate: currentForm.date,
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
        await getSalesInvoicesByYear(year);
      } else {
        await addPurchaseInvoice(Number(currentForm.customerId), payload);
        await getPurchaseInvoiceByYear(year);
      }
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const currentForm = mode === "sales" ? salesForm : purchaseForm;
  const currentCalc = mode === "sales" ? salesCalculation : purchaseCalculation;

  return {
    state: {
      mode,
      salesForm,
      purchaseForm,
      materials,
      customers,
      salesCalculation,
      purchaseCalculation,
      currentForm,
      currentCalc,
    },
    handlers: {
      setMode,
      setSalesForm,
      setPurchaseForm,
      handleItemChange,
      handleRateChange,
      addItem,
      removeItem,
      submitForm,
    },
  };
};
