"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: { children: React.ReactNode; title: string; subtitle?: string; footer?: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-md glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg glow-ring" style={{ background: "var(--gradient-hero)" }} />
          <span className="font-display text-xl tracking-wide gradient-text">Finquest</span>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="text-muted-foreground mt-1">{subtitle}</p> : null}
        <div className="mt-5">{children}</div>
        {footer ? <div className="mt-5 text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return toast("Please enter your email and password")
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      login(res.data.token)
      toast.success("Signed in")
      const to = location.state?.from || "/dashboard"
      navigate(to, { replace: true })
    } catch (err: any) {
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Trade smart. Learn fast. Shine brighter."
      footer={
        <div>
          {"Don't have an account? "}
          <NavLink className="underline hover:opacity-90" to="/auth/register">
            Sign up
          </NavLink>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block text-sm">
          Password
          <div className="mt-1 relative">
            <input
              type={show ? "text" : "password"}
              className="w-full glass px-3 py-2 rounded-lg pr-20 focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto text-xs px-2 py-1 rounded hover:opacity-90"
              aria-pressed={show}
              title={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`ripple-btn w-full rounded-lg px-4 py-2 ${loading ? "opacity-70 cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  )
}
