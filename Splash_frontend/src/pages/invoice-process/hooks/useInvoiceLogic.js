import { useEffect, useMemo, useState } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial.js";
import { useClient } from "../../../../backend/store/useClient.js";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice.js";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice.js";
import { useYear } from "../../../context/YearContext.jsx";
import { useTenant } from "../../../context/TenantContext.jsx";
import toast from "react-hot-toast";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import { useVoucher } from "../../../../backend/store/useVoucher.js";

export const useInvoiceLogic = () => {
  const { materials, getMaterials, loading: materialLoading } = useMaterial();
  const { customers, getAllCustomers, loading: customersLoading } = useClient();
  const {
    addSalesInvoice,
    getSalesInvoicesByYear,
    loading: salesLoading,
  } = useSalesInvoice();
  const {
    addPurchaseInvoice,
    getPurchaseInvoiceByYear,
    loading: purchaseLoading,
  } = usePurchaseInvoice();
  const {
    convertCurrency,
    getDailyRates,
    getFileNo,
    loading: commonDataLoading,
  } = useCommonData();
  const { getAllOpeningVoucherByYear } = useVoucher();
  const { year } = useYear();
  const { tenant } = useTenant();

  const [refreshCouter, setRefreshCounter] = useState(0);

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("invoice_mode") || "sales";
  });

  useEffect(() => {
    localStorage.setItem("invoice_mode", mode);
  }, [mode]);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (!tenant) return;
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
    let ignore = false;
    const fetchData = () => {
      const newState = getInitialFormState(year);
      if (!ignore) {
        setSalesForm((prev) => ({ ...prev, date: newState.date }));
        setPurchaseForm((prev) => ({ ...prev, date: newState.date }));
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [year, tenant]);

  const [salesForm, setSalesForm] = useState(() => getInitialFormState(year));
  const [purchaseForm, setPurchaseForm] = useState(() =>
    getInitialFormState(year),
  );

  const calculateItemsWithRates = (items, rates, materials, mode) => {
    return (Array.isArray(items) ? items : []).map((item) => {
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
    let ignore = false;

    const fetchData = async () => {
      const currentForm = mode === "sales" ? salesForm : purchaseForm;
      const date = currentForm.date;
      if (!date) return;
      try {
        const [rates, nextNo] = await Promise.all([
          getDailyRates(date),
          getFileNo(date, mode.toUpperCase()),
        ]);
        const setter = mode === "sales" ? setSalesForm : setPurchaseForm;

        setter((prev) => ({
          ...prev,
          fileNo: nextNo || "",
          usdSellingRate: rates?.USD || prev.usdSellingRate || "",
          eurSellingRate: rates?.EUR || prev.eurSellingRate || "",
          items: rates
            ? calculateItemsWithRates(prev.items, rates, materials, mode)
            : prev.items,
        }));
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
  }, [mode, tenant, salesForm.date, purchaseForm.date, refreshCouter]);

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

    const invoiceDate = currentForm.date;
    try {
      if (currency !== "TRY") {
        const calculatedPrice = await convertCurrency(
          basePrice,
          currency,
          invoiceDate,
        );
        finalPrice = calculatedPrice || basePrice;
      } else {
        finalPrice = basePrice;
      }
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
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

  const roundHalfUp = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const calculateRow = (price, qty, kdvRate) => {
    const p = Number(price) || 0;
    const q = Number(qty) || 0;
    const k = Number(kdvRate) || 0;

    const lineTotal = roundHalfUp(p * q);

    const kdvTutar = roundHalfUp((lineTotal * k) / 100);

    return { lineTotal: lineTotal.toFixed(2), kdvTutar: kdvTutar.toFixed(2) };
  };

  const handleItemChange = (formType, index, field, value) => {
    const setter = formType === "sales" ? setSalesForm : setPurchaseForm;

    const parsedValue = parseNumber(value);

    if (field === "materialId") {
      handleMaterialSelect(formType, index, parsedValue);
      return;
    }
    setter((prev) => {
      const newItems = [...prev.items];
      const currentItem = { ...newItems[index], [field]: parsedValue };

      if (field === "lineTotal") {
        const qty = Number(currentItem.quantity) || 1;
        const newTotal = Number(parsedValue) || 0;
        currentItem.unitPrice = (newTotal / (qty === 0 ? 1 : qty)).toFixed(6);
      } else if (field === "quantity" || field === "unitPrice") {
        const qty = Number(currentItem.quantity) || 0;
        const up = Number(currentItem.unitPrice) || 0;

        currentItem.lineTotal = (qty * up).toFixed(2);
      }
      const { kdvTutar } = calculateRow(
        Number(currentItem.unitPrice) || 0,
        Number(currentItem.quantity) || 0,
        Number(currentItem.kdv) || 0,
      );
      currentItem.kdvTutar = kdvTutar;

      newItems[index] = currentItem;
      return { ...prev, items: newItems };
    });
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

      const updatedItems = (
        Array.isArray(updatedForm.items) ? updatedForm.items : []
      ).map((item) => {
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
      date: currentForm.date || "",
      currencyDate: currentForm.date || "",
      fileNo: currentForm.fileNo || "",
      kdvToplam: Number(currentCalc.kdv) || 0,
      totalPrice: Number(currentCalc.total) || 0,
      eurSellingRate: Number(currentForm.eurSellingRate) || 0,
      usdSellingRate: Number(currentForm.usdSellingRate) || 0,
      ...(isSales ? { customer: { id: Number(currentForm.customerId) } } : {}),
      items: (Array.isArray(currentForm.items) ? currentForm.items : []).map(
        (i) => {
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
        },
      ),
    };

    try {
      if (isSales) {
        await addSalesInvoice(Number(currentForm.customerId), payload, tenant);
        await getSalesInvoicesByYear(year);
      } else {
        await addPurchaseInvoice(
          Number(currentForm.customerId),
          payload,
          tenant,
        );
        await getPurchaseInvoiceByYear(year);
      }
      resetForm();

      setRefreshCounter((prev) => prev + 1);

      await Promise.all([
        getAllCustomers(),
        getAllOpeningVoucherByYear(`${year}-01-01`, tenant),
      ]);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const currentForm = mode === "sales" ? salesForm : purchaseForm;
  const currentCalc = mode === "sales" ? salesCalculation : purchaseCalculation;

  const formatNumber = (val) => {
    if (!val && val !== 0) return "";
    let parts = val.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  };

  const parseNumber = (val) => {
    if (typeof val !== "string") return val;
    return val.replace(/\./g, "").replace(",", ".");
  };

  const isLoading =
    materialLoading ||
    customersLoading ||
    purchaseLoading ||
    salesLoading ||
    commonDataLoading;

  return {
    state: {
      formatNumber,
      isLoading,
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
