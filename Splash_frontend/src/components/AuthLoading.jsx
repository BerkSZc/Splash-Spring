import React from "react";

const AuthLoading = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]"></div>

      <div className="relative flex flex-col items-center">
        <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-12 animate-pulse">
          SPLASH
        </h1>

        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>

          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-emerald-400 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div className="absolute inset-4 rounded-full bg-blue-500/5 blur-md"></div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">
            Doğrulanıyor
          </p>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite_300ms]"></span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 text-gray-600 text-[10px] tracking-widest uppercase">
        Güvenli Oturum Başlatılıyor
      </div>
    </div>
  );
};

export default AuthLoading;
