/*---------------------------------------
                            KALDIRILCAK
---------------------------------------*/

import { useState } from "react";
import { useAuthentication } from "../../backend/store/useAuthentication.js";
import toast from "react-hot-toast";

const AuthPage = () => {
  const { login, signUp, loading } = useAuthentication();

  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }

    if (mode === "login") {
      await login({ username, password });
    } else {
      await signUp({ username, password });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Arka plan süslemesi - Hafif bir ışık hüzmesi */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] backdrop-blur-md shadow-2xl p-10 space-y-8">
          {/* BAŞLIK VE İKON */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-4 bg-blue-600/10 rounded-2xl text-blue-500 mb-2">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {mode === "login" ? "Tekrar Hoş Geldiniz" : "Yeni Hesap Oluştur"}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === "login"
                ? "Lütfen giriş bilgilerinizi kullanarak devam edin."
                : "Sisteme dahil olmak için bilgilerinizi doldurun."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* KULLANICI ADI */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  disabled={loading}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kullanici_adi"
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* ŞİFRE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Şifre
              </label>
              <input
                disabled={loading}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>

            {/* SUBMIT BUTONU */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98]
            ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed italic"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 hover:shadow-blue-600/40"
            }
          `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {mode === "login"
                      ? "Giriş yapılıyor..."
                      : "Kayıt yapılıyor..."}
                  </span>
                </div>
              ) : mode === "login" ? (
                "Giriş Yap"
              ) : (
                "Kaydı Tamamla"
              )}
            </button>
          </form>

          {/* ALT GEÇİŞ KISMI */}
          <div className="pt-6 border-t border-gray-800 text-center">
            {mode === "login" ? (
              <p className="text-gray-400 text-sm">
                Hesabın yok mu?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1"
                >
                  Hemen Kayıt Ol
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-sm">
                Zaten hesabın var mı?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1"
                >
                  Oturum Aç
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Alt telif veya versiyon bilgisi */}
        <p className="mt-8 text-center text-gray-600 text-xs tracking-widest uppercase font-medium">
          Berk Sözcü &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
