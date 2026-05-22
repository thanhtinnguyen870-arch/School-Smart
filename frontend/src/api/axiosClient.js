import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

export default axiosClient;
