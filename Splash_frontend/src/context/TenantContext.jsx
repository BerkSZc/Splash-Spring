import { createContext, useContext, useEffect, useState } from "react";
import { useCompany } from "../../backend/store/useCompany.js";
import toast from "react-hot-toast";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const { getAllCompanies } = useCompany();

  const [tenant, setTenantState] = useState(
    localStorage.getItem("tenant") || "logo",
  );
  // Şirketleri state içinde tutuyoruz
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        await getAllCompanies();
        if (ignore) return;
      } catch (error) {
        const backendErr =
          error?.response?.data?.exception?.message || "Bilinmeyen Hata";
        toast.error(backendErr);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [tenant]);

  const changeTenant = (newTenant) => {
    const val = String(newTenant);
    setTenantState(val);
    localStorage.setItem("tenant", val);
    // Axios header güncellemelerini burada yapıyorsun zaten
  };

  return (
    <TenantContext.Provider value={{ tenant, changeTenant }}>
      {children}
    </TenantContext.Provider>
  );
};
export const useTenant = () => useContext(TenantContext);
