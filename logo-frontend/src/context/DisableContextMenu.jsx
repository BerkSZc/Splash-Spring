import { useEffect } from "react";

//Sağ tık ile pop-up açmasını engelleyen sayfa
const DisableContextMenu = ({ children }) => {
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handler);

    return () => {
      document.removeEventListener("contextmenu", handler);
    };
  }, []);

  return <>{children}</>;
};

export default DisableContextMenu;
