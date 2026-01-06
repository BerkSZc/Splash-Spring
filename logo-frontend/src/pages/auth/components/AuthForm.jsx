export const AuthForm = ({ state, handlers }) => {
  const { mode, username, password, loading } = state;
  const { setUsername, setPassword, handleSubmit } = handlers;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* KULLANICI ADI */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
          Kullanıcı Adı
        </label>
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
          }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>
              {mode === "login" ? "Giriş yapılıyor..." : "Kayıt yapılıyor..."}
            </span>
          </div>
        ) : mode === "login" ? (
          "Giriş Yap"
        ) : (
          "Kaydı Tamamla"
        )}
      </button>
    </form>
  );
};
