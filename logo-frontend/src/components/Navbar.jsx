import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthentication } from "../../backend/store/useAuthentication";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { logout, isAuthenticated } = useAuthentication();

  // Tema state (localStorage ile persist)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Tema değiştiğinde HTML'e uygula
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
              Malzeme Ekle
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
            <div className="relative">
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
                    to="/profil"
                    className="block px-4 py-2 hover:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    Profil
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

          {/* MOBILE BUTTON */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 dark:bg-gray-800 px-4 py-3 space-y-2">
          <Link className="block hover:text-gray-300" to={"/malzeme-ekle"}>
            Malzeme Ekle
          </Link>

          <Link className="block hover:text-gray-300" to={"/faturalar"}>
            Faturalar
          </Link>

          <Link className="block hover:text-gray-300" to={"/musteriler"}>
            Müşteriler
          </Link>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="block w-full text-left hover:text-gray-300"
          >
            Ayarlar
          </button>

          {settingsOpen && (
            <div className="ml-4 space-y-2">
              <Link className="block hover:text-gray-300" to="/profil">
                Profil
              </Link>

              <button
                onClick={toggleTheme}
                className="block hover:text-gray-300"
              >
                {isDark ? "Aydınlık Tema" : "Koyu Tema"}
              </button>

              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="block text-red-400 hover:text-red-200"
                >
                  Çıkış Yap
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
