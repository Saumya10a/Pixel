import { EventEmitter } from "events"

type UserEvent =
  | { type: "xp"; xpDelta: number; source: "trade" | "lesson" | "challenge"; totalXp?: number }
  | { type: "activity"; text: string; xpDelta?: number }
  | { type: "lesson-progress"; lessonId: string; percent: number }
  | {
      type: "trade"
      tradeId: string
      symbol: string
      side: "BUY" | "SELL"
      price: number
      qty: number
      createdAt: string
    }
  | { type: "profile"; name?: string; avatarUrl?: string }
  | { type: "badge"; badge: string } // NEW

export const bus = new EventEmitter()
bus.setMaxListeners(1000)

export function publishToUser(userId: string, event: UserEvent) {
  bus.emit(`user:${userId}`, event)
}
