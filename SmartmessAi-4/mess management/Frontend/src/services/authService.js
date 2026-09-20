import api from "./api";

const authService = {
  // Student Login via backend custom JWT auth (supports email or registration number)
  studentLogin: async (identifier, password) => {
    const response = await api.post("/students/login", { identifier: identifier, email: identifier, password });
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.student));
      localStorage.setItem("role", "student");
    }
    return response.data;
  },

  // Admin Login via custom JWT auth
  adminLogin: async (email, password) => {
    const response = await api.post("/admin/login", { email, password });
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", "admin");
    }
    return response.data;
  },

  // Staff Login via custom JWT auth
  staffLogin: async (email, password) => {
    const response = await api.post("/staff/login", { email, password });
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", "staff");
    }
    return response.data;
  },

  // Bridge student Firebase Login to backend JWT
  studentLoginBridge: async (email, name) => {
    const response = await api.post("/students/firebase-login", { email, name });
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.student));
      localStorage.setItem("role", "student");
    }
    return response.data;
  },

  // Get current user profile from backend
  getProfile: async (role) => {
    let endpoint = "/students/profile";
    if (role === "admin") {
      endpoint = "/admin/profile";
    } else if (role === "staff") {
      endpoint = "/staff/profile";
    }
    const response = await api.get(endpoint);
    return response.data;
  },

  // Logout utility
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },
};

export default authService;
