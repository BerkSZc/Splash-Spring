import { useRef, useState } from "react";
import { useImportXml } from "../../../../backend/store/useImportXml";
import { useExportXml } from "../../../../backend/store/useExportXml";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";

export const useXmlImportLogic = () => {
  const purchaseInvoiceInputRef = useRef(null);
  const salesInvoiceInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const collectionInputRef = useRef(null);
  const payrollInputRef = useRef(null);
  const voucherInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("import");
  const { year } = useYear();
  const { tenant } = useTenant();

  const {
    importPurchaseInvoice,
    importMaterials,
    importCustomers,
    importCollections,
    importSalesInvoice,
    importPayrolls,
    importVouchers,
  } = useImportXml();

  const {
    exportPurchaseInvoice,
    exportSalesInvoice,
    exportMaterials,
    exportCustomers,
    exportCollections,
    exportPayrolls,
    exportOpeningVouchers,
  } = useExportXml();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      upload(file, type, e.target);
    }
  };

  const handleAction = async (type) => {
    if (viewMode === "import") {
      const refMap = {
        invoice: purchaseInvoiceInputRef,
        sales: salesInvoiceInputRef,
        materials: materialInputRef,
        customers: customerInputRef,
        collections: collectionInputRef,
        payrolls: payrollInputRef,
        vouchers: voucherInputRef,
      };
      refMap[type]?.current?.click();
    } else {
      setLoading(true);
      try {
        if (type === "invoice") await exportPurchaseInvoice(year);
        else if (type === "sales") await exportSalesInvoice(year);
        else if (type === "materials") await exportMaterials();
        else if (type === "customers") await exportCustomers();
        else if (type === "collections") await exportCollections(year);
        else if (type === "payrolls") await exportPayrolls(year);
        else if (type === "vouchers") await exportOpeningVouchers(year);
      } finally {
        setLoading(false);
      }
    }
  };

  const upload = async (file, type, targetInput) => {
    if (!file) return;
    setLoading(true);

    try {
      if (type === "invoice") await importPurchaseInvoice(file, tenant);
      else if (type === "materials") await importMaterials(file);
      else if (type === "customers") await importCustomers(file);
      else if (type === "collections") await importCollections(file, tenant);
      else if (type === "sales") await importSalesInvoice(file, tenant);
      else if (type === "payrolls") await importPayrolls(file, tenant);
      else if (type === "vouchers") await importVouchers(file);
    } finally {
      setLoading(false);
      if (targetInput) targetInput.value = "";
    }
  };

  return {
    state: { loading, viewMode, year },
    refs: {
      purchaseInvoiceInputRef,
      salesInvoiceInputRef,
      materialInputRef,
      customerInputRef,
      collectionInputRef,
      payrollInputRef,
      voucherInputRef,
    },
    handlers: { handleFileChange, setViewMode, handleAction },
  };
};
