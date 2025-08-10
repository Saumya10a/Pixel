"use client"

import { NavLink, Outlet, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Trophy, BookOpen, LineChart, LayoutDashboard, User, HomeIcon, Info, Mail } from "lucide-react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRealtime } from "@/hooks/use-realtime"

export default function MainLayout() {
  const location = useLocation()
  const { isAuthenticated, logout, token } = useAuthContext()

  useRealtime(token)

  const publicNav = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Mail },
  ]
  const appNav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/learn", label: "Learn", icon: BookOpen },
    { to: "/trade", label: "Trade", icon: LineChart },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/profile", label: "Profile", icon: User },
  ]
  const nav = isAuthenticated ? appNav : publicNav

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, hsl(var(--brand-emerald) / 0.35), transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, hsl(var(--brand-gold) / 0.28), transparent)" }}
        />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <NavLink
              to="/"
              className="flex items-center gap-3 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2"
            >
              <motion.div
                layout
                className="h-8 w-8 rounded-lg glow-ring"
                style={{ background: "var(--gradient-hero)" }}
              />
              <span className="font-display text-xl tracking-wide gradient-text">Finquest</span>
            </NavLink>

            <nav className="flex items-center gap-1">
              {nav.map((n) => {
                const Icon = n.icon as any
                const active = location.pathname === n.to
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      `ripple-btn group relative rounded-lg px-3 py-2 text-sm transition ${isActive ? "glow-ring" : ""}`
                    }
                    onMouseMove={(e) => {
                      const el = e.currentTarget as HTMLElement
                      const rect = el.getBoundingClientRect()
                      el.style.setProperty("--x", `${e.clientX - rect.left}px`)
                      el.style.setProperty("--y", `${e.clientY - rect.top}px`)
                    }}
                  >
                    <div
                      className={`flex items-center gap-2 rounded-md px-3 py-2 glass ${active ? "" : "hover:glow-ring"}`}
                    >
                      <Icon size={18} />
                      <span>{n.label}</span>
                    </div>
                  </NavLink>
                )
              })}

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="ml-2 ripple-btn rounded-lg px-3 py-2 text-sm glass hover:glow-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  Sign out
                </button>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <NavLink
                    to="/auth/login"
                    className="ripple-btn rounded-lg px-3 py-2 text-sm glass hover:glow-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/auth/register"
                    className="ripple-btn rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Register
                  </NavLink>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border/40 py-8 mt-8">
        <div className="container mx-auto px-4 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Finquest. All rights reserved.</p>
          <p>Crafted with motion-first design — Emerald × Gold.</p>
        </div>
      </footer>
    </div>
  )
}
