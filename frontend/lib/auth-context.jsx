"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getRoles, setUnauthorizedHandler } from "./api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const resolveRole = useCallback(
    async (accessToken, currentUser) => {
      try {
        const roles = await getRoles(accessToken);
        const matched = roles.find((r) => r.id === currentUser.role_id) ?? null;
        setRole(matched);
      } catch {
        setRole(null);
      }
    },
    []
  );

  const clearSession = useCallback(() => {
    setUser(null);
    setRole(null);
    setToken(null);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    clearSession();
    router.push("/login");
  }, [clearSession, router]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      router.push("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data?.token && data?.user) {
          setToken(data.token);
          setUser(data.user);
          await resolveRole(data.token, data.user);
        }
      } catch {
        // no active session
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveRole]);

  const login = useCallback(
    async (username, password) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid username or password");
      }
      const data = await res.json();
      const sessionRes = await fetch("/api/session");
      const session = await sessionRes.json();
      setToken(session.token);
      setUser(session.user ?? data.user);
      await resolveRole(session.token, session.user ?? data.user);
    },
    [resolveRole]
  );

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isLoading,
      isSuperAdmin: role?.name === "super_admin",
      login,
      logout,
    }),
    [user, role, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
