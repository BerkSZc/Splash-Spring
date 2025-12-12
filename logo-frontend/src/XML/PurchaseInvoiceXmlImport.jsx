import React, { useRef, useState } from "react";
import { useImportXml } from "../../backend/store/useImportXml";

function XmlImportPage() {
  const invoiceInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const cashInputRef = useRef(null); // ← YENİ

  const [loading, setLoading] = useState(false);

  const {
    importPurchaseInvoice,
    importMaterials,
    importCustomers,
    importCollections, // ← YENİ
  } = useImportXml();

  // Tüm upload işlemleri tek fonksiyonda
  const upload = async (file, type) => {
    if (!file) return;

    setLoading(true);

    if (type === "invoice") {
      await importPurchaseInvoice(file);
    } else if (type === "materials") {
      await importMaterials(file);
    } else if (type === "customers") {
      await importCustomers(file);
    } else if (type === "cash") {
      await importCollections(file); // ← YENİ
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold text-center mb-6">
        XML Veri Aktarma Merkezi
      </h2>

      {/* FATURA XML INPUT */}
      <input
        type="file"
        accept=".xml"
        ref={invoiceInputRef}
        className="hidden"
        onChange={(e) => upload(e.target.files[0], "invoice")}
      />

      <button
        onClick={() => invoiceInputRef.current.click()}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 mb-4 rounded-md"
      >
        {loading ? "Yükleniyor..." : "Fatura XML Yükle"}
      </button>

      {/* MALZEME XML INPUT */}
      <input
        type="file"
        accept=".xml"
        ref={materialInputRef}
        className="hidden"
        onChange={(e) => upload(e.target.files[0], "materials")}
      />

      <button
        onClick={() => materialInputRef.current.click()}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 mb-4 rounded-md"
      >
        {loading ? "Yükleniyor..." : "Malzeme XML Yükle"}
      </button>

      {/* CARI XML INPUT */}
      <input
        type="file"
        accept=".xml"
        ref={customerInputRef}
        className="hidden"
        onChange={(e) => upload(e.target.files[0], "customers")}
      />

      <button
        onClick={() => customerInputRef.current.click()}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 mb-4 rounded-md"
      >
        {loading ? "Yükleniyor..." : "Cari XML Yükle"}
      </button>

      {/* KASA İŞLEMLERİ XML INPUT — YENİ */}
      <input
        type="file"
        accept=".xml"
        ref={cashInputRef}
        className="hidden"
        onChange={(e) => upload(e.target.files[0], "cash")}
      />

      <button
        onClick={() => cashInputRef.current.click()}
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 mt-4 rounded-md"
      >
        {loading ? "Yükleniyor..." : "Kasa İşlemleri XML Yükle"}
      </button>
    </div>
  );
}

export default XmlImportPage;
