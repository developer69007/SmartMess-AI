import axios from "axios";

// Standard Axios instance configured for our Node.js backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If JWT expires or is invalid, clean up local storage and redirect to login
    if (error.response && error.response.status === 401) {
      const isLoginUrl = error.config && error.config.url && error.config.url.includes('/login');
      
      if (!isLoginUrl) {
        const role = localStorage.getItem("role");
        
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        
        if (role === "admin") {
          window.location.href = "/login/admin";
        } else if (role === "staff") {
          window.location.href = "/login/staff";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
