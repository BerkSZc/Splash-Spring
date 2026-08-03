import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCompany } from "../../backend/store/useCompany.js";
import toast from "react-hot-toast";
import { useAuthentication } from "../../backend/store/useAuthentication.js";

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const { companies, getAllCompanies } = useCompany();
  const { isAuthenticated } = useAuthentication();

  const [tenant, setTenantState] = useState(
    localStorage.getItem("tenant") || "splash",
  );

  // Şirketleri state içinde tutuyoruz
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, []);

  const currentCompany = useMemo(() => {
    const dataArray = Array.isArray(companies) ? companies : [];
    return dataArray.find((c) => c.schemaName === tenant) || null;
  }, [companies, tenant]);

  const changeTenant = (newTenant) => {
    const val = String(newTenant);
    setTenantState(val);
    localStorage.setItem("tenant", val);
    // Axios header güncellemelerini burada yapıyorsun zaten
  };

  return (
    <TenantContext.Provider value={{ tenant, changeTenant, currentCompany }}>
      {children}
    </TenantContext.Provider>
  );
};
export const useTenant = () => useContext(TenantContext);
