import React, { useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-4">
          {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Kullanıcı Adı
            </label>
            <input
              disabled={loading}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              disabled={loading}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-medium transition
              ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading
              ? mode === "login"
                ? "Giriş yapılıyor..."
                : "Kayıt yapılıyor..."
              : mode === "login"
              ? "Giriş Yap"
              : "Kayıt Ol"}
          </button>
        </form>

        {/* ALT KISIM */}
        <div className="mt-6 text-center">
          {mode === "login" ? (
            <p className="text-sm">
              Hesabın yok mu?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Kayıt Ol
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Zaten hesabın var mı?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 font-semibold hover:underline"
              >
                Giriş Yap
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
