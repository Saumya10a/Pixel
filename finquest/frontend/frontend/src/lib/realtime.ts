import { queryClient } from "./query-client"

export function startRealtime(token: string, apiUrl: string) {
  const base = apiUrl.replace(/\/+api\/?$/, "")
  const es = new EventSource(`${base}/api/events?token=${encodeURIComponent(token)}`)

  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      switch (data.type) {
        case "xp":
          queryClient.setQueryData(["stats"], (prev: any) => {
            if (!prev?.data) return prev
            const next = { ...prev }
            next.data = {
              ...prev.data,
              xp: typeof data.totalXp === "number" ? data.totalXp : (prev.data.xp || 0) + (data.xpDelta || 0),
            }
            return next
          })
          break
        case "activity":
          queryClient.setQueryData(["stats"], (prev: any) => {
            if (!prev?.data) return prev
            const activities = Array.isArray(prev.data.activities) ? prev.data.activities.slice(0) : []
            activities.unshift({
              text: data.text,
              xpDelta: data.xpDelta ?? 0,
              createdAt: new Date().toISOString(),
            })
            const next = { ...prev }
            next.data = { ...prev.data, activities: activities.slice(0, 10) }
            return next
          })
          break
        case "lesson-progress":
          queryClient.setQueryData(["lessons"], (prev: any) => {
            if (!prev?.data) return prev
            const list = prev.data.map((l: any) => (l.id === data.lessonId ? { ...l, progress: data.percent } : l))
            return { ...prev, data: list }
          })
          break
        case "trade":
          queryClient.invalidateQueries({ queryKey: ["trades"] })
          break
        case "profile":
          queryClient.setQueryData(["me"], (prev: any) => {
            if (!prev?.data) return prev
            return {
              ...prev,
              data: {
                ...prev.data,
                name: data.name ?? prev.data.name,
                avatarUrl: data.avatarUrl ?? prev.data.avatarUrl,
              },
            }
          })
          break
        case "badge": {
          // Merge badge into stats.badges
          queryClient.setQueryData(["stats"], (prev: any) => {
            if (!prev?.data) return prev
            const badges: string[] = Array.isArray(prev.data.badges) ? prev.data.badges.slice(0) : []
            if (!badges.includes(data.badge)) badges.unshift(data.badge)
            return { ...prev, data: { ...prev.data, badges } }
          })
          break
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  es.onerror = () => {
    // auto-reconnect; optionally log
  }

  return () => es.close()
}
