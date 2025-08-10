"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, NavLink } from "react-router-dom"
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

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) return toast("Please fill all required fields")
    if (password !== confirm) return toast("Passwords do not match")
    setLoading(true)
    try {
      const res = await api.register({ name, email, password })
      // Auto-login after registration
      login(res.data.token)
      toast.success("Account created")
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      toast.error(err?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Finquest and start your journey."
      footer={
        <div>
          {"Already have an account? "}
          <NavLink className="underline hover:opacity-90" to="/auth/login">
            Sign in
          </NavLink>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>
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
          <input
            type="password"
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <label className="block text-sm">
          Confirm password
          <input
            type="password"
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`ripple-btn w-full rounded-lg px-4 py-2 ${loading ? "opacity-70 cursor-not-allowed" : "bg-secondary text-secondary-foreground"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </AuthShell>
  )
}
