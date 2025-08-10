import type React from "react"
import type { PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"

type AuthCardProps = PropsWithChildren<{
  title?: string
  subtitle?: string
  footer?: React.ReactNode
}>

export default function AuthCard({ title = "Welcome back", subtitle, footer, children }: AuthCardProps) {
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
        {!footer ? (
          <div className="mt-5 text-sm text-muted-foreground">
            {"New here? "}
            <NavLink className="underline hover:opacity-90" to="/auth/register">
              Create an account
            </NavLink>
          </div>
        ) : null}
      </div>
    </div>
  )
}
