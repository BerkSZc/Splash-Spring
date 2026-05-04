export const AuthForm = ({ state, handlers }) => {
  const { mode, username, password, description, companyName, loading } = state;
  const {
    setUsername,
    setPassword,
    setDescription,
    setCompanyName,
    handleSubmit,
  } = handlers;

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

      {/* ŞİRKET BİLGİLERİ  */}
      {mode === "signup" && (
        <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-gray-700 my-2" />

          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-400 uppercase ml-1">
              Şirket Adı
            </label>
            <input
              disabled={loading}
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Örn: Berk Yazılım A.Ş."
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-400 uppercase ml-1">
              Şirket Açıklaması
            </label>
            <input
              disabled={loading}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kısa bir açıklama giriniz..."
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      )}

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
