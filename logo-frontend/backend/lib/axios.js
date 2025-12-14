import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/rest/api",

  withCredentials: true,
});

let selectedTenant = "A";
export const setTenant = (tenant) => {
  selectedTenant = tenant;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (selectedTenant) {
      config.headers["X-Tenant-ID"] = selectedTenant;
    }
    console.log("Current tenant:", selectedTenant);

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token süresi dolmuş
      localStorage.removeItem("token");
      window.location.href = "/login"; // otomatik yönlendirme
    }
    return Promise.reject(error);
  }
);
