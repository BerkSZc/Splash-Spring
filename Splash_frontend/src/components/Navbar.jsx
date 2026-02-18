import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthentication } from "../../backend/store/useAuthentication";
import YearDropdown from "./YearDropdown.jsx";
import CompanyDropDown from "./CompanyDropDown.jsx";

export default function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { logout, isAuthenticated } = useAuthentication();

  const dropDownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        settingsOpen &&
        dropDownRef.current &&
        !dropDownRef.current.contains(event.target)
      )
        setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [settingsOpen]);

  return (
    <nav className="bg-gray-800 text-white relative dark:bg-gray-900 dark:text-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold  space-x-4">
            <Link to={"/home"}>SPLASH</Link>
          </div>
          {/* DESKTOP MENU */}
          <div className="hidden md:flex space-x-5 items-center mx-auto">
            <Link className="hover:text-gray-300" to={"/malzeme-ekle"}>
              Malzemeler
            </Link>

            <Link
              className="hover:text-gray-300 whitespace-nowrap"
              to={"/tahsilatlar"}
            >
              Kasa İşlemleri
            </Link>

            <Link
              className="hover:text-gray-300 whitespace-nowrap"
              to={"/faturalar-islemleri"}
            >
              Fatura İşlemleri
            </Link>

            <Link className="hover:text-gray-300" to={"/faturalar"}>
              Faturalar
            </Link>
            <Link
              className="hover:text-gray-300 whitespace-nowrap"
              to={"/payroll"}
            >
              Çek-Senet İşlemleri
            </Link>

            <Link className="hover:text-gray-300" to={"/musteriler"}>
              Cari Hesaplar
            </Link>

            <Link
              className="hover:text-gray-300 whitespace-nowrap"
              to="/raporlar"
            >
              Raporlar
            </Link>

            {!isAuthenticated && (
              <Link className="hover:text-gray-300" to={"/login"}>
                Giriş Yap
              </Link>
            )}

            {/* AYARLAR MENÜSÜ */}
            <div className="relative" ref={dropDownRef}>
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className="hover:text-gray-300 flex items-center"
              >
                Diğer İşlemler
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 bg-gray-700 dark:bg-gray-800 shadow-lg rounded-md w-40 py-2 z-50">
                  <Link
                    onClick={() => {
                      setSettingsOpen(false);
                    }}
                    to="/devir"
                    className="block px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    Şirket Seçim
                  </Link>
                  <Link
                    onClick={() => {
                      setSettingsOpen(false);
                    }}
                    className="block px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-700"
                    to={"/ekleme"}
                  >
                    Veri İşlemleri{" "}
                  </Link>

                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        logout();
                        setSettingsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-300 hover:text-white"
                    >
                      Çıkış Yap
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <nav className="flex justify-between items-center px-6 py-3 ">
              <div className="flex items-center gap-3 ml-30">
                <CompanyDropDown />
                <YearDropdown />
              </div>
            </nav>
          )}
        </div>
      </div>
    </nav>
  );
}
