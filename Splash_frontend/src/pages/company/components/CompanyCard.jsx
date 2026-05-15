import { useEffect, useRef, useState } from "react";
import { ContextMenu } from "./ContextMenu";

export const CompanyCard = ({ company, isSelected, onSelect, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClose = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    const handleClickOutside = (event) => {
      if (!isMenuOpen) return;

      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleClose, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect()}
      className={`relative group cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-blue-500 bg-blue-500/5 shadow-[0_0_25px_rgba(59,130,246,0.15)]"
          : "border-gray-800 bg-gray-900/40 hover:border-gray-600"
      }`}
    >
      <div className="absolute top-6 right-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-2 hover:bg-gray-700 rounded-xl transition-colors text-gray-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {isMenuOpen && (
          <ContextMenu
            onEdit={() => {
              onEdit(company);
              setIsMenuOpen(false);
            }}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div
          className={`p-4 rounded-2xl ${
            isSelected ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        {isSelected && (
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
        )}
      </div>
      <h4 className="text-2xl font-bold text-white mb-2">{company.name}</h4>
      <p className="text-gray-400 text-sm">
        {company.description || company.desc}
      </p>
    </div>
  );
};
