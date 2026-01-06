import { useEffect, useRef, useState } from "react";
import { usePurchaseInvoice } from "../../../../backend/store/usePurchaseInvoice";
import { useSalesInvoice } from "../../../../backend/store/useSalesInvoice";
import { useMaterial } from "../../../../backend/store/useMaterial";
import { useClient } from "../../../../backend/store/useClient";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";
import { generateInvoiceHTML } from "../../../utils/printHelpers.js";

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
  const { year } = useYear();
  const { tenant } = useTenant();

  const [invoiceType, setInvoiceType] = useState("purchase");
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

  useEffect(() => {
    if (!year) return;
    getMaterials();
    getAllCustomers();
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
  }, [year, invoiceType, tenant]);

  useEffect(() => {
    if (!form) return;
    const araToplam = form.items.reduce(
      (sum, i) => sum + (Number(i.unitPrice) * Number(i.quantity) || 0),
      0
    );
    const kdvMiktari = form.items.reduce((sum, i) => {
      const base = Number(i.unitPrice) * Number(i.quantity) || 0;
      return sum + (base * (Number(i.kdv) || 0)) / 100;
    }, 0);
    setTotals({
      totalPrice: araToplam,
      kdvToplam: kdvMiktari,
      grandTotal: araToplam + kdvMiktari,
    });
  }, [form?.items]);

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

  const executePrint = (inv) => {
    if (!inv) return;
    const printWindow = window.open("", "_blank", "width=1000, height=800");
    if (printWindow) {
      const html = generateInvoiceHTML(inv, invoiceType);
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintItem(null);
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setForm({
      date: invoice.date,
      fileNo: invoice.fileNo,
      customerId: invoice.customer.id,
      items: invoice.items.map((i) => ({
        materialId: String(i.material.id),
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        kdv: i.kdv,
        lineTotal:
          invoiceType === "purchase"
            ? i.unitPrice * i.quantity * (1 + i.kdv / 100)
            : i.unitPrice * i.quantity,
      })),
    });
  };

  const handleSave = async () => {
    const payload = {
      date: form.date,
      fileNo: form.fileNo,
      customer: { id: Number(form.customerId) },
      items: form.items.map((i) => ({
        material: { id: Number(i.materialId) },
        unitPrice: Number(i.unitPrice),
        quantity: Number(i.quantity),
        kdv: Number(i.kdv),
      })),
    };
    invoiceType === "purchase"
      ? await editPurchaseInvoice(editingInvoice.id, payload)
      : await editSalesInvoice(editingInvoice.id, payload);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setEditingInvoice(null);
    setForm(null);
  };

  const confirmDelete = async () => {
    invoiceType === "purchase"
      ? await deletePurchaseInvoice(deleteTarget.id)
      : await deleteSalesInvoice(deleteTarget.id);
    invoiceType === "purchase"
      ? getPurchaseInvoiceByYear(year)
      : getSalesInvoicesByYear(year);
    setDeleteTarget(null);
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
      executePrint,
      handleEdit,
      handleSave,
      confirmDelete,
      setDeleteTarget,
    },
  };
};
