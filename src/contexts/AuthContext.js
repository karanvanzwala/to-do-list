"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import safeStorage from "@/lib/storage";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only check for existing token in browser environment
    if (isBrowser()) {
      const storedToken = safeStorage.getItem("token");
      const storedUser = safeStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call with static data
      const mockUsers = [
        {
          id: 1,
          email: "admin@example.com",
          password: "Admin123!",
          name: "Admin User",
        },
        {
          id: 2,
          email: "user@example.com",
          password: "User123!",
          name: "Regular User",
        },
      ];

      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;
        const userData = { id: user.id, email: user.email, name: user.name };

        setToken(mockToken);
        setUser(userData);

        safeStorage.setItem("token", mockToken);
        safeStorage.setItem("user", JSON.stringify(userData));

        return { success: true, user: userData };
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      // Simulate API call with static data
      const mockToken = `mock_jwt_token_${Date.now()}`;
      const userData = {
        id: Date.now(),
        email,
        name,
      };

      setToken(mockToken);
      setUser(userData);

      safeStorage.setItem("token", mockToken);
      safeStorage.setItem("user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    safeStorage.removeItem("token");
    safeStorage.removeItem("user");
    // Only redirect in browser environment
    if (isBrowser()) {
      router.push("/login");
    }
  };

  const isAuthenticated = () => {
    // During SSR, return false to prevent hydration issues
    if (!isBrowser()) return false;
    return !!token && !!user;
  };

  // Helper function to check if we're in browser environment
  const isBrowser = () => typeof window !== "undefined";

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
