import { useState } from "react";
import InvoiceForm from "../../invoice-process/InvoiceForm.jsx";

export default function InvoiceAddModal({ onClose, initialType }) {
  const [activeType, setActiveType] = useState(initialType || "sales");
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex justify-center items-center z-[9999] backdrop-blur-md">
      <div className="bg-[#0f172a] border border-gray-800 rounded-[3rem] w-full max-w-[1300px] min-h-[80vh] max-h-[95vh] overflow-y-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          ✕
        </button>

        <InvoiceForm type={activeType} onSuccess={onClose} />
      </div>
    </div>
  );
}
