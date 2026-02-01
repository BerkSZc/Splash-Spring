import { useEffect } from "react";

const DisableContextMenu = ({ children }) => {
  useEffect(() => {
    // 1. Sağ Tık Engelleme
    const handleContextMenu = (e) => e.preventDefault();

    // 2. Klavye Kısayolları (F12, Ctrl+U, Ctrl+Shift+I, Ctrl+S)
    const handleKeyDown = (e) => {
      // if (
      //   e.keyCode === 123 || // F12
      //   (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
      //   (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (Source)
      //   (e.ctrlKey && e.keyCode === 83) || // Ctrl+S (Save)
      //   (e.ctrlKey && e.keyCode === 80) // Ctrl+P (Print)
      // ) {
      //   e.preventDefault();
      // }
    };

    // 3. Sürükle-Bırak Engelleme (Görsellerin çalınmasını önler)
    const handleDrag = (e) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDrag);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDrag);
    };
  }, []);

  return (
    <div className="select-none overflow-hidden">
      {/* CSS: select-none metin seçimini engeller */}
      {children}
    </div>
  );
};
export default DisableContextMenu;
