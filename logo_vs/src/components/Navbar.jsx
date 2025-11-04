import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <div className="text-xl font-bold">LOGO</div>

          {/* MENU (DESKTOP) */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-gray-300">
              <Link to={"/malzeme-ekle"}>Malzeme Ekle</Link>
            </a>
            <a href="#" className="hover:text-gray-300">
              Faturalar
            </a>
            <a href="#" className="hover:text-gray-300">
              <Link to={"/musteriler"}> Müşteriler </Link>
            </a>
            <a href="#" className="hover:text-gray-300">
              Ayarlar
            </a>
          </div>

          {/* MOBILE BUTTON */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 px-4 py-3 space-y-2">
          <a href="#" className="block hover:text-gray-300">
            Dashboard
          </a>
          <a href="#" className="block hover:text-gray-300">
            Faturalar
          </a>
          <a href="#" className="block hover:text-gray-300">
            Müşteriler
          </a>
          <a href="#" className="block hover:text-gray-300">
            Ayarlar
          </a>
        </div>
      )}
    </nav>
  );
}
