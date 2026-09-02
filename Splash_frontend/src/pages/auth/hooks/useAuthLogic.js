import { useState } from "react";
import { useAuthentication } from "../../../../backend/store/useAuthentication.js";
import toast from "react-hot-toast";
import { useTenant } from "../../../context/TenantContext.jsx";
import { useYear } from "../../../context/YearContext.jsx";

export const useAuthLogic = () => {
  const { login, signUp, loading } = useAuthentication();

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [vdNo, setVdNo] = useState("");

  const { changeTenant } = useTenant();
  const { changeYear } = useYear();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }
    try {
      let response;
      if (mode === "login") {
        response = await login({ username, password });
      } else {
        response = await signUp({
          username,
          password,
          companyName,
          invoiceDescription,
          companyAddress,
          vdNo,
        });
      }

      const newSchema = response?.schemaName;
      if (newSchema) {
        changeTenant(newSchema);

        if (response?.yearValue) {
          changeYear(response.yearValue);
        } else {
          changeYear(new Date().getFullYear());
        }
      }
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  return {
    state: {
      mode,
      username,
      password,
      companyName,
      invoiceDescription,
      companyAddress,
      vdNo,
      loading,
    },
    handlers: {
      setMode,
      setUsername,
      setPassword,
      setCompanyName,
      setInvoiceDescription,
      setCompanyAddress,
      setVdNo,
      handleSubmit,
    },
  };
};
