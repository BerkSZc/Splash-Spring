import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/" },
    { id: "reports", label: "Finansal Raporlar", icon: "📈", path: "/reports" },
    { id: "payroll", label: "Çek / Senet", icon: "📜", path: "/payroll" },
    {
      id: "customers",
      label: "Cari Yönetimi",
      icon: "👥",
      path: "/musteriler",
    },
    { id: "settings", label: "Ayarlar", icon: "⚙️", path: "/ayarlar" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0f172a]/90 backdrop-blur-xl border-r border-gray-800 transition-all duration-500 ease-in-out z-50 shadow-2xl ${
        isExpanded ? "w-72" : "w-24"
      }`}
    >
      {/* Genişletme/Daraltma Butonu */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-12 bg-blue-600 hover:bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white border-4 border-[#0a0f1a] transition-all shadow-lg active:scale-90"
      >
        {isExpanded ? "◀" : "▶"}
      </button>

      {/* Logo Alanı */}
      <div className="p-8 mb-6 flex items-center gap-4 overflow-hidden">
        <div className="min-w-[48px] h-[48px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-2xl font-black text-white">S</span>
        </div>
        <div
          className={`transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}
        >
          <h1 className="font-black text-xl tracking-tighter text-white">
            SOZCU
          </h1>
          <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">
            Finans
          </p>
        </div>
      </div>

      {/* Menü Listesi */}
      <nav className="px-4 space-y-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30"
                  : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-300"
              }`}
            >
              <span
                className={`text-2xl transition-transform duration-300 ${!isExpanded && "group-hover:scale-125"}`}
              >
                {item.icon}
              </span>

              <span
                className={`text-sm font-black whitespace-nowrap transition-all duration-300 ${
                  isExpanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10 pointer-events-none"
                }`}
              >
                {item.label}
              </span>

              {/* Kapalıyken üzerine gelince çıkan ipucu (Tooltip) */}
              {!isExpanded && (
                <div className="absolute left-full ml-6 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl whitespace-nowrap z-[100]">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Alt Profil Alanı */}
      <div className="absolute bottom-8 left-0 w-full px-4">
        <div
          className={`flex items-center gap-3 p-3 bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden ${!isExpanded && "justify-center"}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-700 flex-shrink-0 border border-gray-600"></div>
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate text-ellipsis">
                Berk Sözcü
              </p>
              <p className="text-[10px] text-gray-500">Yönetici</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
