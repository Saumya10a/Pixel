"use client"

import { useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"

const STORAGE_KEY = "token"

export function useAuth() {
  const { token, isAuthenticated, login, logout } = useAuthContext()

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) login(e.newValue || "")
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [login])

  return { token, isAuthenticated, login, logout }
}
