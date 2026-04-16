"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, AIModel } from "@/lib/models";

export interface User {
  email: string;
  name?: string;
  role: "user" | "admin";
  tokens?: number;
  disabledFeatures?: string[];
  planName?: string;
  aiTools?: string[];
}

export interface AIModelWithConfig extends AIModel {
  isEnvConfigured?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, role?: "user" | "admin") => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  models: AIModelWithConfig[];
  isLoadingModels: boolean;
  refreshModels: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [models, setModels] = useState<AIModelWithConfig[]>(AVAILABLE_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // 🔥 FETCH USER (FIXED)
  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        console.error("Auth failed:", res.status);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();

      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // 🔥 FETCH MODELS
  const refreshModels = async () => {
    setIsLoadingModels(true);
    try {
      const headers: Record<string, string> = {};

      Object.entries(apiKeys).forEach(([provider, key]) => {
        if (key) headers[`x-provider-key-${provider}`] = key;
      });

      const res = await fetch("/api/ai/models", { headers });

      if (res.ok) {
        const data = await res.json();

        if (data.models?.length > 0) {
          setModels(data.models);

          const exists = data.models.find((m: AIModelWithConfig) => m.id === selectedModel);

          if (!exists) {
            const fallback =
              data.models.find((m: AIModelWithConfig) => m.id === DEFAULT_MODEL_ID) ||
              data.models[0];

            if (fallback) setSelectedModel(fallback.id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch models", e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    refreshModels();
  }, [apiKeys]);

  // 🔥 LOGIN
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error };

    } catch {
      return { success: false, error: "Login failed" };
    }
  };

  // 🔥 REGISTER
  const register = async (name: string, email: string, password: string, role: "user" | "admin" = "user") => {
    try {
      const endpoint = role === "admin" ? "/api/admin/register" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error };

    } catch {
      return { success: false, error: "Registration failed" };
    }
  };

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  // 🔥 LOCAL STORAGE
  useEffect(() => {
    const savedModel = localStorage.getItem("selectedModel");
    if (savedModel) setSelectedModel(savedModel);

    try {
      const savedKeys = localStorage.getItem("apiKeys");
      if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    } catch {
      console.error("Failed to load api keys");
    }
  }, []);

  const setApiKey = (provider: string, key: string) => {
    setApiKeys(prev => {
      const updated = { ...prev, [provider]: key };
      localStorage.setItem("apiKeys", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSetModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem("selectedModel", modelId);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        apiKeys,
        setApiKey,
        selectedModel,
        setSelectedModel: handleSetModel,
        models,
        isLoadingModels,
        refreshModels
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}