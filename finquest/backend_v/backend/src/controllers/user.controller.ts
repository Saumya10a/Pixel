import { StatusCodes } from "http-status-codes"
import { z } from "zod"
import { User } from "../models/user.js"
import { Activity } from "../models/activity.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { publishToUser } from "../events/bus.js"

export async function meStatsController(req: any, res: any) {
  const user = await User.findById(req.user!.id)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found")

  const activities = await Activity.find({ user: user.id }).sort({ createdAt: -1 }).limit(10)

  return res.json(
    new ApiResponse("Stats", {
      xp: user.xp,
      streak: user.streak,
      badges: user.badges,
      rankPercent: user.rankPercent,
      activities,
    }),
  )
}

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(64),
  avatarUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
})

export async function updateProfileController(req: any, res: any) {
  const { name, avatarUrl } = req.body as z.infer<typeof updateProfileSchema>
  const update: any = { name }
  if (typeof avatarUrl !== "undefined") update.avatarUrl = avatarUrl

  const user = await User.findByIdAndUpdate(req.user!.id, update, { new: true })
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found")

  publishToUser(req.user!.id, { type: "profile", name: user.name, avatarUrl: user.avatarUrl || undefined })

  return res.json(
    new ApiResponse("Profile updated", {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
    }),
  )
}
