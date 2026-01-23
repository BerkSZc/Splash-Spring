import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthentication } from "../../backend/store/useAuthentication";
import YearDropdown from "./YearDropdown.jsx";
import CompanyDropDown from "./CompanyDropDown.jsx";

export default function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { logout, isAuthenticated } = useAuthentication();

  const dropDownRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

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

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((p) => !p);

  return (
    <nav className="bg-gray-800 text-white relative dark:bg-gray-900 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <div className="text-xl font-bold">
            <Link to={"/home"}>LOGO</Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link className="hover:text-gray-300" to={"/malzeme-ekle"}>
              Malzemeler
            </Link>

            <Link className="hover:text-gray-300" to={"/tahsilatlar"}>
              Tahsilatlar
            </Link>

            <Link className="hover:text-gray-300" to={"/faturalar-islemleri"}>
              Fatura İşlemleri
            </Link>

            <Link className="hover:text-gray-300" to={"/faturalar"}>
              Faturalar
            </Link>
            <Link className="hover:text-gray-300" to={"/payroll"}>
              Çek-Senet İşlemleri
            </Link>

            <Link className="hover:text-gray-300" to={"/ekleme"}>
              Araçlar{" "}
            </Link>

            <Link className="hover:text-gray-300" to={"/musteriler"}>
              Müşteriler
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
                Ayarlar
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
                    to="/devir"
                    className="block px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    Şirket Seçim
                  </Link>

                  {/* DARK MODE TOGGLE */}
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    {isDark ? "Aydınlık Tema" : "Koyu Tema"}
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={logout}
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
              <div className="flex items-center gap-3 ml-auto">
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
