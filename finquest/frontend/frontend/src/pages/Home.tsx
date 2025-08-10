"use client"

import { motion } from "framer-motion"
import { Trophy, ShieldCheck, ArrowRight } from "lucide-react"
import { NavLink } from "react-router-dom"

export default function Home() {
  return (
    <div className="relative overflow-hidden">
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

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Cinematic, Gamified <span className="gradient-text">Finance Learning</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Learn the markets, place simulated trades, and climb the leaderboard — all in a motion-first, glassmorphic
              experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/auth/register"
                className="ripple-btn rounded-lg px-5 py-3 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Get started — it’s free
              </NavLink>
              <NavLink
                to="/auth/login"
                className="ripple-btn rounded-lg px-5 py-3 glass hover:glow-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign in
              </NavLink>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} /> No real money. Learn safely.
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Trophy size={18} /> Earn XP and badges
              </div>
            </div>
          </div>

          <motion.div
            className="glass p-6 rounded-xl lg:justify-self-end w-full max-w-lg mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg glow-ring" style={{ background: "var(--gradient-hero)" }} />
              <div>
                <p className="font-semibold leading-tight">Daily Streak</p>
                <p className="text-sm text-muted-foreground">Keep learning — keep glowing</p>
              </div>
            </div>
            <div className="aspect-video rounded-xl bg-muted/40 grid place-items-center">
            <div className="text-center w-full h-full flex items-center justify-center">
                <img
                    src="/Graph.jpg"
                    alt="Graph preview"
                    className="mx-auto mb-2 rounded-lg shadow-lg w-full h-full object-contain"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
                {/* <p className="text-sm text-muted-foreground">Live Preview</p>
                <p className="font-semibold">Dashboard • Achievements • Trades</p> */}
            </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="glass rounded p-3 text-center">
                <p className="text-muted-foreground">XP</p>
                <p className="font-semibold">12,430</p>
              </div>
              <div className="glass rounded p-3 text-center">
                <p className="text-muted-foreground">Badges</p>
                <p className="font-semibold">5</p>
              </div>
              <div className="glass rounded p-3 text-center">
                <p className="text-muted-foreground">Rank</p>
                <p className="font-semibold">Top 18%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="glass p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Start your Finquest today</h3>
              <p className="text-sm text-muted-foreground">Join free. Learn fast. Shine brighter.</p>
            </div>
            <div className="flex gap-3">
              <NavLink
                to="/auth/register"
                className="ripple-btn rounded-lg px-5 py-3 bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create account
              </NavLink>
              <NavLink
                to="/auth/login"
                className="ripple-btn rounded-lg px-5 py-3 glass hover:glow-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2"
              >
                Sign in <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
