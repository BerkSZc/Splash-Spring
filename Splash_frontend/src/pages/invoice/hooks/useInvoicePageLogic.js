import { useEffect, useMemo, useRef, useState } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice";
import { useMaterial } from "../../../../backend/store/useMaterial";
import { useClient } from "../../../../backend/store/useClient";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
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
  } = usePurchaseInvoice();
  const {
    sales,
    editSalesInvoice,
    deleteSalesInvoice,
    getSalesInvoicesByYear,
  } = useSalesInvoice();
  const { materials, getMaterials } = useMaterial();
  const { customers, getAllCustomers } = useClient();
  const { convertCurrency } = useCommonData();
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
    if (!year) return;
    getMaterials();
    getAllCustomers();
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
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
      const updatedItems = prev.items.map((item) => {
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
      });

      return { ...prev, [field]: formattedValue, items: updatedItems };
    });
  };

  const handleMaterialSelect = async (index, materialId) => {
    const selectedMaterial = materials.find((m) => m.id === Number(materialId));
    if (!selectedMaterial) return;

    let finalPrice = 0;

    const basePrice =
      invoiceType === "sales"
        ? selectedMaterial.salesPrice || 0
        : selectedMaterial.purchasePrice || 0;

    const currency =
      invoiceType === "sales"
        ? selectedMaterial.salesCurrency || "TRY"
        : selectedMaterial.purchaseCurrency || "TRY";

    if (currency !== "TRY" && basePrice > 0) {
      const calculatedPrice = await convertCurrency(basePrice, currency);
      finalPrice = calculatedPrice || basePrice;
    } else {
      finalPrice = basePrice;
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

  const handleItemChange = (index, field, value) => {
    if (field === "materialId") {
      handleMaterialSelect(index, value);
    } else {
      setForm((prev) => {
        const newItems = [...prev.items];

        const updatedItem = { ...newItems[index], [field]: value };

        const { lineTotal, kdvTutar } = calculateRow(
          updatedItem.unitPrice,
          updatedItem.quantity,
          updatedItem.kdv,
        );

        newItems[index] = {
          ...updatedItem,
          lineTotal: lineTotal,
          kdvTutar: kdvTutar,
        };
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
      date: invoice.date,
      fileNo: invoice.fileNo,
      customerId: invoice.customer.id,
      usdSellingRate: invoice.usdSellingRate || "",
      eurSellingRate: invoice.eurSellingRate || "",
      items: invoice.items.map((i) => ({
        materialId: String(i.material.id),
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        kdv: i.kdv,
        lineTotal: i.lineTotal || i.unitPrice * i.quantity || 0,
        kdvTutar: i.kdvTutar,
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
      items: form.items.map((i) => ({
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

    invoiceType === "purchase"
      ? await editPurchaseInvoice(editingInvoice.id, payload, tenant)
      : await editSalesInvoice(editingInvoice.id, payload, tenant);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setEditingInvoice(null);
    setForm(null);
  };

  const confirmDelete = async () => {
    invoiceType === "purchase"
      ? await deletePurchaseInvoice(deleteTarget.id, tenant)
      : await deleteSalesInvoice(deleteTarget.id, tenant);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setDeleteTarget(null);
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

    return { lineTotal, kdvTutar };
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

  const filteredInvoices = (
    Array.isArray(invoiceType === "purchase" ? purchase : sales)
      ? invoiceType === "purchase"
        ? purchase
        : sales
      : []
  ).filter((inv) => {
    const term = searchTerm.toLocaleLowerCase("tr-TR");
    return (
      inv.fileNo?.toString().toLocaleLowerCase("tr-TR").includes(term) ||
      inv.customer?.name?.toLocaleLowerCase("tr-TR").includes(term) ||
      inv.date?.toLocaleLowerCase("tr-TR").includes(term)
    );
  });

  return {
    state: {
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
      filteredInvoices,
      year,
      materials,
      customers,
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
