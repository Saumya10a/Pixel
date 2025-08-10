"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { useNavigate } from "react-router-dom"
import {
  Trophy, BookOpen, LineChart as ChartIcon, User,
  TrendingUp, Star, Target, BookOpenCheck
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area
} from "recharts"

function useTypedQuote(quotes: string[], speed = 35) {
  const [text, setText] = React.useState("")
  const [index, setIndex] = React.useState(0)
  useEffect(() => {
    let i = 0
    const current = quotes[index % quotes.length]
    setText("")
    const id = setInterval(() => {
      setText(current.slice(0, i + 1))
      i++
      if (i >= current.length) {
        clearInterval(id)
        setTimeout(() => setIndex((v) => v + 1), 2500)
      }
    }, speed)
    return () => clearInterval(id)
  }, [index, quotes, speed])
  return text
}

function XPArc({ value = 62 }) {
  const radius = 90
  const circ = 2 * Math.PI * radius
  const offset = circ - (value / 100) * circ
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" className="glow-ring">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={`hsl(var(--brand-emerald))`} />
          <stop offset="100%" stopColor={`hsl(var(--brand-gold))`} />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={radius} stroke="hsl(var(--border))" strokeWidth="14" fill="none" />
      <circle
        cx="110"
        cy="110"
        r={radius}
        stroke="url(#grad)"
        strokeLinecap="round"
        strokeWidth="16"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        fill="none"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-semibold"
        style={{ fill: "hsl(var(--foreground))" }}
      >
        {Math.round(value)}% XP
      </text>
    </svg>
  )
}

export default function Dashboard() {
  useEffect(() => { document.title = "Finquest — Dashboard" }, [])

  const navigate = useNavigate()
  const quotes = useMemo(() => [
    "Wealth is the product of a man’s capacity to think.",
    "Risk comes from not knowing what you’re doing.",
    "An investment in knowledge pays the best interest.",
  ], [])
  const quote = useTypedQuote(quotes, 28)

  const bgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!bgRef.current) return
    gsap.fromTo(bgRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
  }, [])

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.myStats(),
    staleTime: 10_000,
  })

  const actions = [
    { label: "Learn", icon: BookOpen, to: "/learn" },
    { label: "Trade", icon: ChartIcon, to: "/trade" },
    { label: "Leaderboard", icon: Trophy, to: "/leaderboard" },
    { label: "Profile", icon: User, to: "/profile" },
  ]

  const xp = stats?.data?.xp ?? 0
  const streak = stats?.data?.streak ?? 0
  const rankPercent = stats?.data?.rankPercent ?? 100
  const activities = stats?.data?.activities ?? []
  const xpPercentRing = Math.min(100, (xp % 1000) / 10)

  const activityIcons: Record<string, React.ElementType> = {
    lesson: BookOpenCheck,
    challenge: Target,
    achievement: Star,
    default: TrendingUp,
  }

  // Prepare detailed chart data
  let cumulativeXP = 0
  const chartData = activities.map((a: any, i: number) => {
    cumulativeXP += a.xpDelta || 0
    return {
      name: a.text ? a.text : `Activity ${i + 1}`,
      xpGain: a.xpDelta || 0,
      totalXP: cumulativeXP,
    }
  })

  return (
    <div className="space-y-10">
      {/* Header */}
      <section ref={bgRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Welcome back, <span className="gradient-text">Investor</span>
            </h1>
          <p className="text-muted-foreground max-w-2xl">{quote}</p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="glass p-6 flex flex-col items-center">
            <XPArc value={xpPercentRing} />
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">Daily Streak</p>
              <p className="text-xl font-semibold">{streak} days 🔥</p>
            </div>
            <div className="mt-3 text-center text-sm text-muted-foreground">Rank: Top {rankPercent}%</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(a.to)}
              className="glass p-5 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-3">
                <Icon />
                <span className="font-medium">{a.label}</span>
              </div>
            </motion.button>
          )
        })}
      </section>

      {/* Detailed Recent Activity */}
      <section className="glass p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

        {/* XP Detailed Graph */}
        <div className="h-64 w-full mb-6">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="xpColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--brand-emerald))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--brand-emerald))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Area
                type="monotone"
                dataKey="totalXP"
                stroke="hsl(var(--brand-gold))"
                fill="url(#xpColor)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="xpGain"
                stroke="hsl(var(--brand-emerald))"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Cards */}
        <div className="space-y-4">
          {activities.map((r: any, i: number) => {
            const Icon = activityIcons[r.type] || activityIcons.default
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <span className="font-medium">{r.text || `Activity ${i + 1}`}</span>
                </div>
                {r.xpDelta && (
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    +{r.xpDelta} XP
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
