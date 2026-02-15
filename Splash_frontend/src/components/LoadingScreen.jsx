const LoadingScreen = ({
  message = "Veriler Getiriliyor",
  subMessage = "Lütfen bekleyiniz...",
}) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#0a0f1a]/90 backdrop-blur-md">
      {/* Arka Plan Glow Efektleri */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative flex flex-col items-center">
        {/* Ana Spinner Yapısı */}
        <div className="relative w-20 h-20 mb-8">
          {/* Dış Halka */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>

          {/* Dönen Neon Halka */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-400 animate-spin shadow-[0_0_15px_rgba(96,165,250,0.4)]"></div>

          {/* İç Ters Dönen Halka */}
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-emerald-400 animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>

          {/* Merkezdeki Parlama */}
          <div className="absolute inset-7 bg-blue-500 rounded-full blur-sm animate-pulse"></div>
        </div>

        {/* Metin Alanı */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-blue-400 font-black tracking-[0.4em] uppercase text-lg">
              {message}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase font-medium">
              {subMessage}
            </p>
            {/* İlerleme Çizgisi Animasyonu */}
            <div className="w-32 h-[2px] bg-gray-800 mt-4 overflow-hidden rounded-full">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-[loading-bar_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Konfigürasyonu için Özel Keyframe (isteğe bağlı style tagı) */}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
