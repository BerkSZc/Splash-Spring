import { useState } from "react";
import { useAuthentication } from "../../../../backend/store/useAuthentication.js";
import { useTenant } from "../../../context/TenantContext.jsx";
import toast from "react-hot-toast";

export const useAuthLogic = () => {
  const { login, signUp, loading } = useAuthentication();
  const { tenant } = useTenant();

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }
    try {
      if (mode === "login") {
        await login({ username, password }, tenant);
      } else {
        await signUp({ username, password }, tenant);
      }
    } catch (error) {
      const backendErr =
        error?.response?.data?.exception?.message || "Bilinmeyen Hata";
      toast.error(backendErr);
    }
  };

  return {
    state: { mode, username, password, loading },
    handlers: { setMode, setUsername, setPassword, handleSubmit },
  };
};
