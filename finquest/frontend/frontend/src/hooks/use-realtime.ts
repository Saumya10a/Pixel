"use client"

import { useEffect, useRef } from "react"
import { startRealtime } from "@/lib/realtime"
import { API_URL } from "@/lib/api"

export function useRealtime(token: string | null) {
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!token) {
      stopRef.current?.()
      stopRef.current = null
      return
    }
    stopRef.current = startRealtime(token, API_URL)
    return () => {
      stopRef.current?.()
      stopRef.current = null
    }
  }, [token])
}
