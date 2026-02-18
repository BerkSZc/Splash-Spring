import { useEffect, useRef } from "react";
import { useAuthentication } from "../store/useAuthentication.js";

export default function TokenWatcher() {
  const { logout } = useAuthentication();
  const timerRef = useRef(null);

  // 14 saat (milisaniye cinsinden: 14 * 60 * 60 * 1000)
  const INACTIVITY_LIMIT = 14 * 60 * 60 * 1000;

  const resetTimer = () => {
    // Mevcut zamanlayıcıyı temizle
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Yeni zamanlayıcı başlat
    timerRef.current = setTimeout(() => {
      console.log("15 dakika hareketsizlik tespit edildi, çıkış yapılıyor...");
      logout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Uygulama ilk açıldığında zamanlayıcıyı başlat
    resetTimer();

    // Takip edilecek kullanıcı hareketleri
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Her hareket algılandığında süreyi sıfırla
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Bileşen kapandığında (cleanup) olayları temizle
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  return null;
}
