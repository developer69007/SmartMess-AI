import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on mount (Auto Login)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Handle all logins (Admin, Staff, Student)
  const login = async (userRole, email, password) => {
    setLoading(true);
    try {
      let data;
      if (userRole === "admin") {
        data = await authService.adminLogin(email, password);
      } else if (userRole === "staff") {
        data = await authService.staffLogin(email, password);
      } else if (userRole === "student") {
        data = await authService.studentLogin(email, password);
      } else {
        throw new Error("Invalid role type for login");
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user || data.student);
        setRole(userRole);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (error) {
      console.error(`${userRole} Login Error:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Server connection error",
      };
    } finally {
      setLoading(false);
    }
  };

  // Direct student login or Firebase Bridge
  const studentLogin = async (identifier, passwordOrName, isBridge = false) => {
    setLoading(true);
    try {
      let data;
      if (isBridge) {
        data = await authService.studentLoginBridge(identifier, passwordOrName);
      } else {
        data = await authService.studentLogin(identifier, passwordOrName);
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.student || data.user);
        setRole("student");
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (error) {
      console.error("Student Login Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Authentication failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout utility
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        loading,
        login,
        studentLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
