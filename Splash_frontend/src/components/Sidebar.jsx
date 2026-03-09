import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthentication } from "../../backend/store/useAuthentication";
import YearDropdown from "./YearDropdown.jsx";
import CompanyDropDown from "./CompanyDropDown.jsx";

const NAV_ITEMS = [
  { label: "Malzemeler", to: "/malzeme-ekle", icon: "📦" },
  { label: "Kasa İşlemleri", to: "/tahsilatlar", icon: "💰" },
  { label: "Fatura İşlemleri", to: "/faturalar-islemleri", icon: "📋" },
  { label: "Faturalar", to: "/faturalar", icon: "🧾" },
  { label: "Çek-Senet", to: "/payroll", icon: "🏦" },
  { label: "Cari Hesaplar", to: "/musteriler", icon: "👥" },
  { label: "Raporlar", to: "/raporlar", icon: "📊" },
];

const BOTTOM_ITEMS = [
  { label: "Şirket Seçim", to: "/devir", icon: "🏢" },
  { label: "Veri İşlemleri", to: "/ekleme", icon: "⚙️" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout, isAuthenticated } = useAuthentication();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !hamburgerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* ── TOP BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-4">
        <button
          ref={hamburgerRef}
          onClick={() => setOpen((p) => !p)}
          className="w-9 h-9 flex flex-col justify-center items-center gap-[5px] group"
          aria-label="Menüyü aç/kapat"
        >
          <span
            className={`block h-[2px] bg-gray-400 transition-all duration-300 origin-center group-hover:bg-white ${
              open ? "w-5 rotate-45 translate-y-[7px]" : "w-5"
            }`}
          />
          <span
            className={`block h-[2px] bg-gray-400 transition-all duration-300 group-hover:bg-white ${
              open ? "w-0 opacity-0" : "w-4"
            }`}
          />
          <span
            className={`block h-[2px] bg-gray-400 transition-all duration-300 origin-center group-hover:bg-white ${
              open ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"
            }`}
          />
        </button>

        <Link
          to="/home"
          className="text-white font-black tracking-[0.15em] text-sm uppercase select-none"
        >
          SPLASH
        </Link>

        <div className="flex-1" />

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <CompanyDropDown />
            <YearDropdown />
          </div>
        )}
      </header>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full z-50 w-72 bg-[#080d17] border-r border-white/5 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center px-5 border-b border-white/5 shrink-0">
          <span className="text-white font-black tracking-[0.15em] text-sm uppercase">
            SPLASH
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setOpen(false)}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 px-3 pb-2 pt-1">
            Ana Menü
          </p>
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                isActive(to)
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
              {isActive(to) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          ))}

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 px-3 pb-2 pt-5">
            Diğer
          </p>
          {BOTTOM_ITEMS.map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive(to)
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <span className="text-base w-5 text-center">🚪</span>
              Çıkış Yap
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="text-base w-5 text-center">🔐</span>
              Giriş Yap
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
