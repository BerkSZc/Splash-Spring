import axios from "axios";
import { useAuthentication } from "../store/useAuthentication";

const isElectron = window?.process?.type === "renderer";

export const axiosInstance = axios.create({
  baseURL: isElectron ? "http://localhost:8080/rest/api" : "/rest/api",

  withCredentials: true,
});
let isDirecting = false;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const currentTenant = localStorage.getItem("tenant") || "logo";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Tenant-ID"] = currentTenant;

    return config;
  },
  (error) => Promise.reject(error),
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response ? error.response.status : null;

//     if ((status === 401 || status === 403) && !isDirecting) {
//       isDirecting = true;
//       // Token süresi dolmuş
//       localStorage.removeItem("token");
//       if (isElectron) {
//         window.location.hash = "#/login";
//       } else {
//         window.location.href = "/login";
//       } // otomatik yönlendirme
//     }
//     return Promise.reject(error);
//   },
// );
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      useAuthentication.getState().logout?.();

      window.dispatchEvent(
        new CustomEvent("AUTH_ERROR", {
          detail: {
            status,
            url: error.config?.url,
          },
        }),
      );
    } else if (status >= 500) {
      window.dispatchEvent(
        new CustomEvent("SERVER_ERROR", {
          detail: {
            status,
            message: error.response?.data?.message || "Sunucu hatası",
          },
        }),
      );
    } else if (!status) {
      window.dispatchEvent(
        new CustomEvent("NETWORK_ERROR", {
          detail: {
            message: "Sunucuya ulaşılamıyor",
          },
        }),
      );
    }

    return Promise.reject(error);
  },
);
