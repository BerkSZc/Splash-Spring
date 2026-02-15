import { useRef, useState } from "react";
import { useImportXml } from "../../../../backend/store/useImportXml";
import { useExportXml } from "../../../../backend/store/useExportXml";
import { useYear } from "../../../context/YearContext";
import { useTenant } from "../../../context/TenantContext";
import toast from "react-hot-toast";

export const useXmlImportLogic = () => {
  const purchaseInvoiceInputRef = useRef(null);
  const salesInvoiceInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const collectionInputRef = useRef(null);
  const payrollInputRef = useRef(null);
  const voucherInputRef = useRef(null);

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
    loading: importLoading,
  } = useImportXml();

  const {
    exportPurchaseInvoice,
    exportSalesInvoice,
    exportMaterials,
    exportCustomers,
    exportCollections,
    exportPayrolls,
    exportOpeningVouchers,
    loading: exportLoading,
  } = useExportXml();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xml") && file.type !== "text/xml") {
      toast.error(
        "Sadece xml dosyaları ile işlem yapılabilir Xml dosyası seçin!",
      );
      e.target.value = "";
      return;
    }

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
      try {
        if (type === "invoice") await exportPurchaseInvoice(year);
        else if (type === "sales") await exportSalesInvoice(year);
        else if (type === "materials") await exportMaterials();
        else if (type === "customers") await exportCustomers();
        else if (type === "collections") await exportCollections(year);
        else if (type === "payrolls") await exportPayrolls(year);
        else if (type === "vouchers") await exportOpeningVouchers(year);
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message ||
          error?.response?.data ||
          "Bilinmeyen hata";
        toast.error(backendErr);
      }
    }
  };

  const upload = async (file, type, targetInput) => {
    if (!tenant) {
      toast.error("Lüften ilk olarak şirket seçin");
      if (targetInput) targetInput.value = "";
      return;
    }
    if (!file) return;

    try {
      if (type === "invoice") await importPurchaseInvoice(file, tenant);
      else if (type === "materials") await importMaterials(file);
      else if (type === "customers") await importCustomers(file);
      else if (type === "collections") await importCollections(file, tenant);
      else if (type === "sales") await importSalesInvoice(file, tenant);
      else if (type === "payrolls") await importPayrolls(file, tenant);
      else if (type === "vouchers") await importVouchers(file, tenant);
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message ||
        error?.response?.data ||
        "Bilinmeyen hata";
      toast.error(backendErr);
    } finally {
      if (targetInput) targetInput.value = "";
    }
  };

  const isLoading = importLoading || exportLoading;

  return {
    state: { isLoading, viewMode, year },
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
