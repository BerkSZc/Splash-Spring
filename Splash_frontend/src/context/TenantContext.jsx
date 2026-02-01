import { createContext, useContext, useEffect, useState } from "react";
import { useCompany } from "../../backend/store/useCompany.js";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const { getAllCompanies } = useCompany();

  const [tenant, setTenantState] = useState(
    localStorage.getItem("tenant") || "logo"
  );

  // Şirketleri state içinde tutuyoruz

  useEffect(() => {
    getAllCompanies();
  }, []);

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
