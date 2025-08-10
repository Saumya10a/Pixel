export const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000/api"

function getToken() {
  try {
    return localStorage.getItem("token")
  } catch {
    return null
  }
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as any) }
  const token = getToken()
  if (token) headers.Authorization = "Bearer " + token

  const res = await fetch(API_URL + path, { ...options, headers })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.message || "Request failed"
    throw new Error(msg)
  }
  return json
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: async (body: { email: string; password: string }) => {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify(body) })
    localStorage.setItem("token", data.data.token)
    return data
  },
  me: () => request("/auth/me"),
  myStats: () => request("/users/me/stats"),
  updateMe: (body: { name: string }) => request("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  lessons: () => request("/lessons"),
  setProgress: (lessonId: string, percent: number) =>
    request(`/lessons/${lessonId}/progress`, { method: "PATCH", body: JSON.stringify({ percent }) }),
  trades: () => request("/trades"),
  createTrade: (trade: { symbol: string; side: "BUY" | "SELL"; price: number; qty: number }) =>
    request("/trades", { method: "POST", body: JSON.stringify(trade) }),
  top: (limit = 10) => request(`/leaderboard/top?limit=${limit}`),
}
