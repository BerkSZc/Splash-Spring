import { useEffect, useMemo, useRef, useState } from "react";
import { useMaterial } from "../../../../backend/store/useMaterial";
import { useClient } from "../../../../backend/store/useClient";
import { useCommonData } from "../../../../backend/store/useCommonData.js";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";
import { generateInvoiceHTML } from "../../../utils/printHelpers.js";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useInvoice } from "../../../../backend/store/useInvoice.js";

export const useInvoicePageLogic = () => {
  const {
    invoice,
    invoiceTotalPages,
    editInvoice,
    deleteInvoice,
    getInvoicesByYear,
    loading: invoiceLoading,
  } = useInvoice();

  const { materials, getMaterials, loading: materialLoading } = useMaterial();
  const { customers, getAllCustomers, loading: customerLoading } = useClient();
  const { convertCurrency, loading: commonDataLoading } = useCommonData();
  const { year, changeYear } = useYear();
  const { tenant, currentCompany } = useTenant();

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const menuRef = useRef(null);
  const [bulkMailModalOpen, setBulkMailModalOpen] = useState(false);
  const [printItem, setPrintItem] = useState(null);
  const [form, setForm] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [contextMenu, setContextMenu] = useState(null);
  const [mailTargetInvoice, setMailTargetInvoice] = useState(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [invoiceType, setInvoiceType] = useState(() => {
    return localStorage.getItem("invoice_type") || "sales";
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get("tab");
  const urlSearch = searchParams.get("search");
  const urlSelectedId = searchParams.get("selectedId");
  const urlYear = searchParams.get("year");

  useEffect(() => {
    if (urlYear && changeYear && Number(urlYear) !== Number(year)) {
      changeYear(Number(urlYear));
    }

    if (urlTab === "sales" || urlTab === "purchase") {
      setInvoiceType(urlTab);
    }

    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }

    if (urlSelectedId) {
      const parsedId = Number(urlSelectedId);
      setSelectedInvoiceIds([parsedId]);
    }
  }, [searchParams]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setInvoiceType(newType);
    setSearchParams({ tab: newType });
  };

  useEffect(() => {
    setShowAddForm(false);
  }, [invoiceType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem("invoice_type", invoiceType);
  }, [invoiceType]);

  useEffect(() => {
    if (
      printItem ||
      deleteTarget ||
      editingInvoice ||
      viewingInvoice ||
      showAddForm ||
      mailTargetInvoice ||
      bulkMailModalOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    printItem,
    deleteTarget,
    editingInvoice,
    viewingInvoice,
    showAddForm,
    mailTargetInvoice,
    bulkMailModalOpen,
  ]);

  useEffect(() => {
    if (!year || !tenant) return;

    const fetchCommonData = async () => {
      try {
        await Promise.all([
          getMaterials(0, 999, "", false, tenant),
          getAllCustomers(0, 999, false, "", tenant, year),
        ]);
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";

        toast.error(backendErr);
      }
    };

    fetchCommonData();
  }, [year, tenant]);

  useEffect(() => {
    if (!year || !tenant) return;

    const fetchInvoices = async () => {
      try {
        const backendType = invoiceType === "purchase" ? "PURCHASE" : "SALES";
        const backendSort = sortOrder.toUpperCase();

        await getInvoicesByYear(
          page,
          PAGE_SIZE,
          backendSort,
          debouncedSearch,
          year,
          tenant,
          backendType,
        );
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";

        toast.error(backendErr);
      }
    };

    fetchInvoices();
  }, [year, invoiceType, tenant, page, debouncedSearch, sortOrder]);

  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }

      if (contextMenu && !event.target.closest(".context-menu-container")) {
        setContextMenu(null);
      }

      if (
        bulkMailModalOpen ||
        mailTargetInvoice ||
        editingInvoice ||
        viewingInvoice
      ) {
        return;
      }

      if (
        !event.target.closest(".invoice-row") &&
        !event.target.closest(".context-menu-container") &&
        !event.target.closest(".modal-container")
      ) {
        setSelectedInvoiceIds([]);
      }
    };

    document.addEventListener("mousedown", handleGlobalClick);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [
    contextMenu,
    bulkMailModalOpen,
    mailTargetInvoice,
    editingInvoice,
    viewingInvoice,
  ]);

  const executePrint = async (inv) => {
    if (!inv) return;
    const printWindow = window.open(
      "about:blank?action=print",
      "_blank",
      "width=1000, height=800",
    );
    if (printWindow) {
      const html = generateInvoiceHTML(
        inv,
        invoiceType,
        customers,
        currentCompany,
      );
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintItem(null);
    }
  };

  const handleToggleSelectInvoice = (id) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (invoices) => {
    const allIds = (Array.isArray(invoices) ? invoices : []).map((i) => i.id);
    if (selectedInvoiceIds.length === allIds.length && allIds.length > 0) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(allIds);
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
            lineTotal: lineTotal,
            kdvTutar: kdvTutar,
          };
        },
      );
      return { ...prev, [field]: formattedValue, items: updatedItems };
    });
  };

  const parseNumber = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === "number") return val;

    let str = val.toString().trim();

    if (str.includes(".") && str.includes(",")) {
      return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
    }

    if (str.includes(",")) {
      return parseFloat(str.replace(",", ".")) || 0;
    }

    if (str.includes(".")) {
      const parts = str.split(".");
      if (parts.length === 2 && parts[1].length <= 2) {
        return parseFloat(str) || 0;
      }
      return parseFloat(str.replace(/\./g, "")) || 0;
    }

    return parseFloat(str) || 0;
  };

  const handleMaterialSelect = async (index, materialId) => {
    const selectedMaterial = materials.find((m) => m.id === Number(materialId));
    if (!selectedMaterial) return;

    const invoiceDate = form.date;

    const basePrice =
      invoiceType === "sales"
        ? selectedMaterial.salesPrice || 0
        : selectedMaterial.purchasePrice || 0;

    const currency =
      invoiceType === "sales"
        ? selectedMaterial.salesCurrency || "TRY"
        : selectedMaterial.purchaseCurrency || "TRY";

    let finalPrice = basePrice;

    try {
      if (currency !== "TRY" && basePrice > 0) {
        const calculatedPrice = await convertCurrency(
          basePrice,
          currency,
          invoiceDate,
        );
        finalPrice = calculatedPrice || basePrice;
      } else {
        finalPrice = basePrice === 0 ? "" : basePrice;
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
        unit: selectedMaterial.unit || "ADET",
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

    if (name === "materialId") {
      handleMaterialSelect(index, rawValue);
      return;
    }

    setForm((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      item[name] = rawValue;

      const qty = parseNumber(name === "quantity" ? rawValue : item.quantity);
      const kdvRate = Number(item.kdv) || 0;

      if (name === "lineTotal") {
        const total = parseNumber(rawValue);
        if (total === 0 || qty === 0) {
          item.unitPrice = "";
          item.kdvTutar = "";
        } else {
          const up = Math.round((total / qty + Number.EPSILON) * 10000) / 10000;
          item.unitPrice = up.toString().replace(".", ",");
          item.kdvTutar = (
            Math.round(((total * kdvRate) / 100 + Number.EPSILON) * 100) / 100
          ).toFixed(2);
        }
      } else {
        const up = parseNumber(
          name === "unitPrice" ? rawValue : item.unitPrice,
        );
        const curQty = parseNumber(
          name === "quantity" ? rawValue : item.quantity,
        );

        if (up === 0 || curQty === 0) {
          item.lineTotal = "";
          item.kdvTutar = "";
        } else {
          const net = Math.round((up * curQty + Number.EPSILON) * 100) / 100;
          const kdvTut =
            Math.round(((net * kdvRate) / 100 + Number.EPSILON) * 100) / 100;
          item.lineTotal = net.toFixed(2);
          item.kdvTutar = kdvTut.toFixed(2);
        }
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const selectedInvoicesData = useMemo(() => {
    const list = Array.isArray(invoice) ? invoice : [];
    return list.filter((inv) => selectedInvoiceIds.includes(inv.id));
  }, [invoice, selectedInvoiceIds]);

  const handleEdit = (invoice) => {
    // MÜŞTERİ KONTROLÜ: Faturadaki müşteriler arşivli ise ismini ekle
    if (invoice.customerId) {
      const invCustId = String(invoice.customerId);

      const customerExists = customers.some((c) => String(c.id) === invCustId);

      if (!customerExists) {
        customers.unshift({
          id: invoice.customerId,
          name: invoice.customerName,
          archived: true,
        });
      }
    }
    //  MALZEME KONTROLÜ: Faturadaki malzemeler listede arşivli ise ismini ekle
    if (Array.isArray(invoice.items)) {
      invoice.items.forEach((item) => {
        if (item.materialId) {
          const materialExists = materials.find(
            (m) => String(m.id) === String(item.materialId),
          );
          if (!materialExists) {
            materials.unshift({
              id: item.materialId,
              code: item.materialCode,
              comment: item.materialName,
              archived: true,
            });
          }
        }
      });
    }

    setEditingInvoice({ ...invoice });
    setForm({
      date: invoice.date || "",
      fileNo: invoice.fileNo || "",
      customerId: invoice?.customerId,
      usdSellingRate: invoice.usdSellingRate || "",
      eurSellingRate: invoice.eurSellingRate || "",
      invoiced: Boolean(invoice.invoiced),
      invoiceType:
        invoice.invoiceType ||
        (invoiceType === "purchase" ? "PURCHASE" : "SALES"),
      items: (Array.isArray(invoice?.items) ? invoice.items : [])
        .sort((a, b) => a.id - b.id)
        .map((i) => {
          const up = Number(i.unitPrice) || 0;
          const qty = Number(i.quantity) || 0;
          const kdv = Number(i.kdv) || 0;
          const net = Math.round((up * qty + Number.EPSILON) * 100) / 100;
          const kdvTut =
            Math.round(((net * kdv) / 100 + Number.EPSILON) * 100) / 100;

          const formattedUp = (
            Math.round((up + Number.EPSILON) * 10000) / 10000
          )
            .toString()
            .replace(".", ",");

          return {
            id: i.id,
            materialId: String(i.materialId),
            unit: i.unit || i.material?.unit || "ADET",
            unitPrice: formattedUp,
            quantity: qty.toString().replace(".", ","),
            kdv: kdv,
            lineTotal: net.toFixed(2),
            kdvTutar: kdvTut.toFixed(2),
          };
        }),
    });
  };

  const handleSave = async () => {
    const customerId = Number(form.customerId);
    const selectedCustomer = (Array.isArray(customers) ? customers : []).find(
      (c) => Number(c.id) === customerId,
    );
    const payload = {
      id: editingInvoice?.id,
      date: form.date,
      fileNo: form.fileNo,
      customerId: customerId || null,
      customerName: selectedCustomer?.customerName || "",
      usdSellingRate: Number(form.usdSellingRate) || 0,
      eurSellingRate: Number(form.eurSellingRate) || 0,
      invoiced: Boolean(form.invoiced),
      invoiceType:
        form.invoiceType || (invoiceType === "purchase" ? "PURCHASE" : "SALES"),
      items: (Array.isArray(form.items) ? form.items : []).map((i) => {
        const rawPrice = parseNumber(i.unitPrice);
        const rawQty = parseNumber(i.quantity);
        const cleanKdv = parseNumber(i.kdv);

        // 🎯 Birim fiyat 4 basamağa kadar hassas (10000):
        const cleanPrice =
          Math.round((rawPrice + Number.EPSILON) * 10000) / 10000;
        const cleanQty = Math.round((rawQty + Number.EPSILON) * 100) / 100;

        const netTutar =
          Math.round((cleanPrice * cleanQty + Number.EPSILON) * 100) / 100;
        const satirKdv =
          Math.round(((netTutar * cleanKdv) / 100 + Number.EPSILON) * 100) /
          100;

        return {
          id: i.id || null,
          materialId: Number(i.materialId),
          unit: i.unit || "ADET",
          unitPrice: cleanPrice,
          quantity: cleanQty,
          kdv: cleanKdv,
          lineTotal: isNaN(netTutar) ? 0 : netTutar,
          kdvTutar: isNaN(satirKdv) ? 0 : satirKdv,
        };
      }),
    };

    const selectedYear = new Date(form.date).getFullYear();
    if (selectedYear !== Number(year)) {
      toast.error("Yeni tarih mali yıl içinde olmalıdır!");
      return;
    }

    const validItems = (Array.isArray(form?.items) ? form.items : []).filter(
      (item) => item.materialId !== "" && item.materialId !== null,
    );

    const hasInvalidValue = validItems.some(
      (item) =>
        Number(item.quantity || 0) <= 0 || Number(item.unitPrice || 0) <= 0,
    );

    if (hasInvalidValue) {
      toast.error("Malzemelerin miktarı veya birim fiyatı 0 olamaz!");
      return;
    }

    try {
      await editInvoice(editingInvoice.id, payload, tenant);
      await getAllCustomers(0, 999, false, "", tenant, year);
      setEditingInvoice(null);
      setSelectedInvoiceIds([]);
      setForm(null);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const handleInvoiceStatusChange = (status) => {
    setForm((prev) => ({
      ...prev,
      invoiced: status,
    }));
  };

  const confirmDelete = async () => {
    setDeleteTarget(null);
    try {
      const backendType = invoiceType === "purchase" ? "PURCHASE" : "SALES";
      await deleteInvoice(deleteTarget.id, tenant, backendType);
      await getAllCustomers(0, 999, false, "", tenant, year);
      setSelectedInvoiceIds([]);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  const roundHalfUp = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const handleView = (invoice) => {
    setViewingInvoice(invoice);
  };

  const calculateRow = (price, qty, kdvRate) => {
    const p = Number(price) || 0;
    const q = Number(qty) || 0;
    const k = Number(kdvRate) || 0;

    const lineTotal = Math.round((p * q + Number.EPSILON) * 100) / 100;

    const kdvTutar =
      Math.round(((lineTotal * k) / 100 + Number.EPSILON) * 100) / 100;

    return { lineTotal: lineTotal.toFixed(2), kdvTutar: kdvTutar.toFixed(2) };
  };

  const modalTotals = useMemo(() => {
    if (!form?.items || !Array.isArray(form.items)) {
      return { subTotal: 0, kdvTotal: 0, generalTotal: 0 };
    }

    const subTotal = form.items.reduce((sum, i) => {
      const val = parseNumber(i.lineTotal);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const kdvTotal = form.items.reduce((sum, i) => {
      const val = parseNumber(i.kdvTutar);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const roundedSub = roundHalfUp(subTotal);
    const roundedKdv = roundHalfUp(kdvTotal);
    const roundedGeneral = roundHalfUp(roundedSub + roundedKdv);

    return {
      subTotal: roundedSub,
      kdvTotal: roundedKdv,
      generalTotal: roundedGeneral,
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
          kdvTutar: "",
          lineTotal: "",
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
    const dataArray = Array.isArray(invoice) ? invoice : [];
    const expectedType = invoiceType === "purchase" ? "PURCHASE" : "SALES";

    const filteredByType = dataArray.filter(
      (inv) => inv.invoiceType === expectedType,
    );

    return filteredByType.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [invoice, invoiceType, sortOrder]);

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
    if (val === undefined || val === null || val === "") return "";

    let str = val.toString();

    // Türkçe sayı
    if (str.includes(",")) {
      const [intPart, decPart] = str.split(",");
      return (
        intPart.replace(/\./g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
        "," +
        decPart
      );
    }

    const num = str.replace(",", ".");

    const [intPart, decPart] = num.split(".");

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
  };

  const handleContextMenu = (e, inv) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inv?.id) return;

    // Fatura seçilmediyse listeye ekleme/koruma kuralı:
    const willBeSelected = selectedInvoiceIds.includes(inv.id)
      ? selectedInvoiceIds
      : [...selectedInvoiceIds, inv.id];

    setSelectedInvoiceIds(willBeSelected);

    const isMultiple = willBeSelected.length > 1;

    const menuWidth = 224;

    const menuHeight = isMultiple ? 60 : 240;

    const x =
      e.clientX + menuWidth > window.innerWidth
        ? e.clientX - menuWidth
        : e.clientX;

    const y =
      e.clientY + menuHeight > window.innerHeight
        ? e.clientY - menuHeight
        : e.clientY;

    setContextMenu({
      x: x,
      y: y,
      invoice: inv,
    });
  };

  const isLoading =
    invoiceLoading || materialLoading || customerLoading || commonDataLoading;

  const clearSelection = () => {
    setContextMenu(null);
    setSelectedInvoiceIds([]);
    setOpenMenuId(null);
  };

  return {
    state: {
      formatNumber,
      invoiceType,
      searchTerm,
      editingInvoice,
      deleteTarget,
      openMenuId,
      menuRef,
      printItem,
      form,
      modalTotals,
      filteredInvoices: sortedAndFilteredInvoices,
      year,
      materials,
      mailTargetInvoice,
      selectedInvoiceIds,
      customers,
      bulkMailModalOpen,
      selectedInvoicesData,
      formatDateToTR,
      isLoading,
      sortOrder,
      contextMenu,
      page,
      totalPages: invoiceTotalPages,
      viewingInvoice,
      showAddForm,
      currentCompany,
    },
    handlers: {
      toggleMenu,
      setSearchTerm,
      setInvoiceType,
      handleTypeChange,
      setSortOrder: (newOrder) => {
        setSortOrder(newOrder);
        setPage(0);
      },
      setEditingInvoice,
      setPrintItem: (item) =>
        setPrintItem(item ? { ...item, invoiceType } : null),
      setForm,
      handleItemChange,
      addItem,
      removeItem,
      handlePriceSelect,
      executePrint,
      handleEdit,
      handleSave,
      handleRateChange,
      handleContextMenu,
      confirmDelete,
      setDeleteTarget,
      setContextMenu,
      setPage,
      setViewingInvoice,
      setBulkMailModalOpen,
      setMailTargetInvoice,
      handleView,
      setShowAddForm,
      handleToggleSelectInvoice,
      handleSelectAll,
      setSelectedInvoiceIds,
      clearSelection,
      handleInvoiceStatusChange,
    },
  };
};
