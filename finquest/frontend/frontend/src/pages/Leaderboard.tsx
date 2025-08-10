"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export default function Leaderboard() {
  useEffect(() => {
    document.title = "Finquest — Leaderboard"
  }, [])

  const { data } = useQuery({ queryKey: ["leaderboard", 10], queryFn: () => api.top(10), staleTime: 5000 })

  const top = data?.data ?? []

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Top Players</h1>
        <p className="text-muted-foreground">Real-time ranks by XP</p>
      </section>

      {/* Highlight top 3 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top.slice(0, 3).map((u: any, i: number) => (
          <motion.div
            key={u.id}
            className={`glass rounded-xl p-6 text-center ${i === 0 ? "glow-ring" : ""}`}
            whileHover={{ y: -2 }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: "var(--gradient-hero)" }} />
            <div className="text-lg font-semibold">{u.name}</div>
            <div className="text-sm text-muted-foreground">XP: {u.xp}</div>
            <div className="mt-2 text-xs text-muted-foreground">Top {u.rankPercent}%</div>
          </motion.div>
        ))}
      </section>

      {/* Rest */}
      <section className="glass p-4">
        <h3 className="font-semibold mb-3">All‑stars</h3>
        <ul className="divide-y divide-border/40">
          {top.slice(3).map((u: any, idx: number) => (
            <li key={u.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm text-muted-foreground">{idx + 4}</span>
                <div className="w-8 h-8 rounded-full" style={{ background: "var(--gradient-hero)" }} />
                <span className="font-medium">{u.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">XP {u.xp}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
