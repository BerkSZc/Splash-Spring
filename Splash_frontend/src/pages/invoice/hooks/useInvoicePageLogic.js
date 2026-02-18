import { useEffect, useMemo, useRef, useState } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice";
import { useMaterial } from "../../../../backend/store/useMaterial";
import { useClient } from "../../../../backend/store/useClient";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import { useVoucher } from "../../../../backend/store/useVoucher.js";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";
import { generateInvoiceHTML } from "../../../utils/printHelpers.js";
import toast from "react-hot-toast";

export const useInvoicePageLogic = () => {
  const {
    purchase,
    editPurchaseInvoice,
    deletePurchaseInvoice,
    getPurchaseInvoiceByYear,
    loading: purchaseLoading,
  } = usePurchaseInvoice();
  const {
    sales,
    editSalesInvoice,
    deleteSalesInvoice,
    getSalesInvoicesByYear,
    loading: salesLoading,
  } = useSalesInvoice();
  const { materials, getMaterials, loading: materialLoading } = useMaterial();
  const { customers, getAllCustomers, loading: customerLoading } = useClient();
  const { convertCurrency, loading: commonDataLoading } = useCommonData();
  const { getAllOpeningVoucherByYear } = useVoucher();
  const { year } = useYear();
  const { tenant } = useTenant();

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [printItem, setPrintItem] = useState(null);
  const [form, setForm] = useState(null);
  const [totals, setTotals] = useState({
    kdvToplam: 0,
    totalPrice: 0,
    grandTotal: 0,
  });
  const [invoiceType, setInvoiceType] = useState(() => {
    return localStorage.getItem("invoice_type") || "sales";
  });

  useEffect(() => {
    localStorage.setItem("invoice_type", invoiceType);
  }, [invoiceType]);

  useEffect(() => {
    if (printItem || deleteTarget || editingInvoice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [printItem, deleteTarget, editingInvoice]);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (!year) return;
      try {
        await Promise.all([getMaterials(), getAllCustomers()]);
        if (ignore) return;

        invoiceType === "purchase"
          ? await getPurchaseInvoiceByYear(year)
          : await getSalesInvoicesByYear(year);
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
  }, [year, invoiceType, tenant]);

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

  const executePrint = async (inv, voucher) => {
    if (!inv) return;
    const printWindow = window.open("", "_blank", "width=1000, height=800");
    if (printWindow) {
      const html = generateInvoiceHTML(inv, invoiceType, voucher);
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintItem(null);
    }
  };

  const syncFinancialData = async () => {
    try {
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

  const handleRateChange = (field, value) => {
    let formattedValue = value.replace(/[^0-9.]/g, "");

    const pointCount = (formattedValue.match(/\./g) || []).length;
    if (pointCount > 1) return;

    if (formattedValue.length > 5) return;

    if (
      formattedValue.length === 2 &&
      !formattedValue.includes(".") &&
      formattedValue.length > (form[field]?.length || 0)
    ) {
      formattedValue += ".";
    }
    const numericRate = Number(formattedValue) || 0;

    setForm((prev) => {
      const updatedItems = (Array.isArray(prev.items) ? prev.items : []).map(
        (item) => {
          const material = materials.find(
            (m) => m.id === Number(item.materialId),
          );
          if (!material) return item;

          const mCurrency =
            invoiceType === "sales"
              ? material.salesCurrency
              : material.purchaseCurrency;
          const mPrice =
            invoiceType === "sales"
              ? material.salesPrice
              : material.purchasePrice;

          let newUnitPrice = item.unitPrice;

          if (field === "usdSellingRate" && mCurrency === "USD")
            newUnitPrice = mPrice * numericRate;
          if (field === "eurSellingRate" && mCurrency === "EUR")
            newUnitPrice = mPrice * numericRate;

          const qty = Number(item.quantity) || 0;
          const kdvRate = Number(item.kdv) || 0;
          const { lineTotal, kdvTutar } = calculateRow(
            newUnitPrice,
            qty,
            kdvRate,
          );

          return {
            ...item,
            unitPrice: newUnitPrice,
            lineTotal,
            kdvTutar,
          };
        },
      );
      return { ...prev, [field]: formattedValue, items: updatedItems };
    });
  };

  const handleMaterialSelect = async (index, materialId) => {
    const selectedMaterial = materials.find((m) => m.id === Number(materialId));
    if (!selectedMaterial) return;

    const invoiceDate = form.date;

    let finalPrice = 0;

    const basePrice =
      invoiceType === "sales"
        ? selectedMaterial.salesPrice || 0
        : selectedMaterial.purchasePrice || 0;

    const currency =
      invoiceType === "sales"
        ? selectedMaterial.salesCurrency || "TRY"
        : selectedMaterial.purchaseCurrency || "TRY";

    try {
      if (currency !== "TRY" && basePrice > 0) {
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

    setForm((prev) => {
      const newItems = [...prev.items];
      const qty = Number(newItems[index].quantity) || 0;
      const kdv = Number(newItems[index].kdv) || 0;
      const { lineTotal, kdvTutar } = calculateRow(finalPrice, qty, kdv);
      newItems[index] = {
        ...newItems[index],
        materialId: String(materialId),
        unitPrice: finalPrice,
        lineTotal,
        kdvTutar,
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index, e, manualValue) => {
    if (!editingInvoice || !form) return;

    const isManual = typeof e === "string";
    const name = isManual ? e : e.target ? e.target.name : "";
    let rawValue = isManual ? manualValue : e.target ? e.target.value : e;

    const value = parseNumber(rawValue);

    if (name === "materialId") {
      handleMaterialSelect(index, value);
      return;
    } else {
      setForm((prev) => {
        const newItems = [...prev.items];
        const item = { ...newItems[index], [name]: value };

        if (name === "lineTotal") {
          const qty = Number(item.quantity) || 1;
          const newTotal = Number(value) || 0;
          item.unitPrice = (newTotal / (qty === 0 ? 1 : qty)).toFixed(6);
        } else if (name === "quantity" || name === "unitPrice") {
          const qty = Number(item.quantity) || 0;
          const up = Number(item.unitPrice) || 0;
          item.lineTotal = (qty * up).toFixed(2);
        }

        const { kdvTutar } = calculateRow(
          Number(item.unitPrice) || 0,
          Number(item.quantity) || 0,
          Number(item.kdv) || 0,
        );

        item.kdvTutar = kdvTutar;
        newItems[index] = item;

        return { ...prev, items: newItems };
      });
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);

    const totalPrice =
      Number(invoice.totalPrice) - Number(invoice.kdvToplam) || 0;
    const kdvToplam = Number(invoice.kdvToplam) || 0;

    setTotals({
      totalPrice: Number(totalPrice.toFixed(2)),
      kdvToplam: Number(kdvToplam.toFixed(2)),
      grandTotal: Number(invoice.totalPrice).toFixed(2) || 0,
    });

    setForm({
      date: invoice.date || "",
      fileNo: invoice.fileNo || "",
      customerId: invoice.customer.id,
      usdSellingRate: invoice.usdSellingRate || "",
      eurSellingRate: invoice.eurSellingRate || "",
      items: (Array.isArray(invoice?.items) ? invoice.items : []).map((i) => ({
        materialId: String(i.material.id),
        unitPrice: i.unitPrice || 0,
        quantity: i.quantity || 0,
        kdv: i.kdv || 0,
        lineTotal: i.lineTotal || i.unitPrice * i.quantity || 0,
        kdvTutar: i.kdvTutar || 0,
      })),
    });
  };

  const handleSave = async () => {
    const customerId = Number(form.customerId);
    const selectedCustomer = customers.find((c) => Number(c.id) === customerId);
    const payload = {
      id: editingInvoice?.id,
      date: form.date,
      fileNo: form.fileNo,
      customer: {
        id: Number(form.customerId),
        name: selectedCustomer?.name || "",
      },
      usdSellingRate: Number(form.usdSellingRate),
      eurSellingRate: Number(form.eurSellingRate),
      items: (Array.isArray(form.items) ? form.items : []).map((i) => ({
        id: i.id || null,
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };

    const selectedYear = new Date(form.date).getFullYear();
    if (selectedYear !== Number(year)) {
      toast.error("Yeni tarih mali yıl içinde olmalıdır!");
      return;
    }

    try {
      if (invoiceType === "purchase") {
        await editPurchaseInvoice(editingInvoice.id, payload, tenant);
        await getPurchaseInvoiceByYear(year);
      } else {
        await editSalesInvoice(editingInvoice.id, payload, tenant);
        await getSalesInvoicesByYear(year);
      }
      await syncFinancialData();
      setEditingInvoice(null);
      setForm(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const confirmDelete = async () => {
    try {
      if (invoiceType === "purchase") {
        await deletePurchaseInvoice(deleteTarget.id, tenant);
        await getPurchaseInvoiceByYear(year);
      } else {
        await deleteSalesInvoice(deleteTarget.id, tenant);
        await getSalesInvoicesByYear(year);
      }
      await syncFinancialData();
      setDeleteTarget(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
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

  const modalTotals = useMemo(() => {
    if (!form?.items) return { subTotal: 0, kdvTotal: 0, generalTotal: 0 };

    const subTotal = roundHalfUp(
      form.items.reduce((sum, i) => sum + Number(i.lineTotal || 0), 0),
    );

    const kdvTotal = roundHalfUp(
      form.items.reduce((sum, i) => sum + Number(i.kdvTutar || 0), 0),
    );

    return {
      subTotal,
      kdvTotal,
      generalTotal: roundHalfUp(subTotal + kdvTotal),
    };
  }, [form?.items]);

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          materialId: "",
          unitPrice: "",
          quantity: "",
          kdv: 20,
          kdvTutar: 0,
          lineTotal: 0,
        },
      ],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handlePriceSelect = (index, price, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setForm((prev) => {
      const updated = [...prev.items];
      const qty = Number(updated[index].quantity) || 0;
      const kdv = Number(updated[index].kdv) || 0;

      const { lineTotal, kdvTutar } = calculateRow(price, qty, kdv);

      updated[index] = {
        ...updated[index],
        unitPrice: price,
        lineTotal,
        kdvTutar,
      };
      return { ...prev, items: updated };
    });
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  const sortedAndFilteredInvoices = useMemo(() => {
    const baseData = invoiceType === "purchase" ? purchase : sales;
    const dataArray = Array.isArray(baseData) ? baseData : [];

    const filtered = dataArray.filter((inv) => {
      const term = searchTerm.toLocaleLowerCase("tr-TR");
      return (
        inv.fileNo?.toString().toLocaleLowerCase("tr-TR").includes(term) ||
        inv.customer?.name?.toLocaleLowerCase("tr-TR").includes(term) ||
        inv.date?.toLocaleLowerCase("tr-TR").includes(term)
      );
    });

    return [...filtered].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [purchase, sales, invoiceType, searchTerm]);

  const formatDateToTR = (dateString) => {
    if (
      !dateString ||
      typeof dateString !== "string" ||
      dateString.includes(".")
    )
      return dateString;
    const [y, m, d] = dateString.split("-");
    return `${d}.${m}.${y}`;
  };

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
    (invoiceType === "purchase" ? purchaseLoading : salesLoading) ||
    materialLoading ||
    customerLoading ||
    commonDataLoading;

  return {
    state: {
      formatNumber,
      invoiceType,
      editingInvoice,
      deleteTarget,
      searchTerm,
      openMenuId,
      menuRef,
      printItem,
      form,
      totals,
      modalTotals,
      filteredInvoices: sortedAndFilteredInvoices,
      year,
      materials,
      customers,
      formatDateToTR,
      isLoading,
    },
    handlers: {
      toggleMenu,
      setEditingInvoice,
      setInvoiceType,
      setSearchTerm,
      setPrintItem,
      setForm,
      handleItemChange,
      addItem,
      removeItem,
      handlePriceSelect,
      executePrint,
      handleEdit,
      handleSave,
      handleRateChange,
      confirmDelete,
      setDeleteTarget,
    },
  };
};
