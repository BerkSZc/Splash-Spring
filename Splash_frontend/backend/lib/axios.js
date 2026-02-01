import axios from "axios";
import { useAuthentication } from "../store/useAuthentication";

export const axiosInstance = axios.create({
  baseURL: "/rest/api",

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
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if ((status === 401 || status === 403) && !isDirecting) {
      isDirecting = true;
      // Token süresi dolmuş
      useAuthentication.getState().logout?.();
      localStorage.removeItem("token");
      window.location.href = "/login"; // otomatik yönlendirme
    }
    return Promise.reject(error);
  }
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Token süresi dolmuş
//       localStorage.clear();

//       localStorage.removeItem("token");
//       window.location.href = "/login"; // otomatik yönlendirme
//     }
//     return Promise.reject(error);
//   }
// );

// EKSTRA 403 kontrolü

// let isDirecting = false;

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     const currentTenant = localStorage.getItem("tenant") || "logo";

//     //Eğer yönlendiriliyor ise isteği engelle.
//     if (isDirecting) {
//       return Promise.reject("Oturum Kapandı");
//     }

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     config.headers["X-Tenant-ID"] = currentTenant;

//     return config;
//   },
//   (error) => Promise.reject(error)
// );
