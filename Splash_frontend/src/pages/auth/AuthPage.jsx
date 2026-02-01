import { useAuthLogic } from "./hooks/useAuthLogic";
import { AuthForm } from "./components/AuthForm";

const AuthPage = () => {
  const { state, handlers } = useAuthLogic();

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Arka plan süslemesi */}
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
              {state.mode === "login"
                ? "Tekrar Hoş Geldiniz"
                : "Yeni Hesap Oluştur"}
            </h2>
            <p className="text-gray-400 text-sm">
              {state.mode === "login"
                ? "Lütfen giriş bilgilerinizi kullanarak devam edin."
                : "Sisteme dahil olmak için bilgilerinizi doldurun."}
            </p>
          </div>

          {/* FORM BİLEŞENİ */}
          <AuthForm state={state} handlers={handlers} />

          {/* ALT GEÇİŞ KISMI */}
          <div className="pt-6 border-t border-gray-800 text-center">
            {state.mode === "login" ? (
              <p className="text-gray-400 text-sm">
                Hesabın yok mu?{" "}
                <button
                  onClick={() => handlers.setMode("signup")}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1"
                >
                  Hemen Kayıt Ol
                </button>
              </p>
            ) : (
              <p className="text-gray-400 text-sm">
                Zaten hesabın var mı?{" "}
                <button
                  onClick={() => handlers.setMode("login")}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1"
                >
                  Oturum Aç
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-gray-600 text-xs tracking-widest uppercase font-medium">
          Berk Sözcü &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
