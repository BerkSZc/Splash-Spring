import { useState } from "react";
import { useAuthentication } from "../../../../backend/store/useAuthentication.js";
import toast from "react-hot-toast";

export const useAuthLogic = () => {
  const { login, signUp, loading } = useAuthentication();

  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }

    if (mode === "login") {
      await login({ username, password });
    } else {
      await signUp({ username, password });
    }
  };

  return {
    state: { mode, username, password, loading },
    handlers: { setMode, setUsername, setPassword, handleSubmit },
  };
};
