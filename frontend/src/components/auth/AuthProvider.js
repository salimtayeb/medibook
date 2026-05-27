"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("medibook_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      setToken(storedToken);
      const response = await api("/api/auth/me");
      if (!response.ok) throw new Error("Token invalid");
      const data = await response.json();
      setUser(data.user);
    } catch {
      localStorage.removeItem("medibook_token");
      localStorage.removeItem("medibook_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  function login(tokenValue, userData) {
    localStorage.setItem("medibook_token", tokenValue);
    localStorage.setItem("medibook_user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("medibook_token");
    localStorage.removeItem("medibook_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
