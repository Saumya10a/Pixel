import { StatusCodes } from "http-status-codes"
import { z } from "zod"
import { Lesson } from "../models/lesson.js"
import { LessonProgress } from "../models/lesson-progress.js"
import { User } from "../models/user.js"
import { Activity } from "../models/activity.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { publishToUser } from "../events/bus.js"

export async function listLessonsController(req: any, res: any) {
  const lessons = await Lesson.find().sort({ createdAt: 1 })
  const progresses = await LessonProgress.find({ user: req.user!.id })
  const progressMap = new Map(progresses.map((p) => [p.lesson.toString(), p.percent]))

  const out = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    progress: progressMap.get(l.id) ?? 0,
  }))

  return res.json(new ApiResponse("Lessons", out))
}

export const updateProgressSchema = z.object({
  percent: z.number().min(0).max(100),
})

export async function updateProgressController(req: any, res: any) {
  const lessonId = req.params.lessonId
  const { percent } = req.body as z.infer<typeof updateProgressSchema>

  const lesson = await Lesson.findById(lessonId)
  if (!lesson) throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found")

  const existing = await LessonProgress.findOne({ user: req.user!.id, lesson: lessonId })
  const prev = existing?.percent ?? 0

  const doc = await LessonProgress.findOneAndUpdate(
    { user: req.user!.id, lesson: lessonId },
    { $max: { percent } }, // only increase progress
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  publishToUser(req.user!.id, { type: "lesson-progress", lessonId, percent: doc.percent })

  let xpAdded = 0
  const newBadges: string[] = []

  if (prev < 100 && doc.percent === 100) {
    // Award XP on first completion
    xpAdded = 50
    const updatedUser = await User.findByIdAndUpdate(req.user!.id, { $inc: { xp: xpAdded } }, { new: true })

    // Activity for completion
    await Activity.create({
      user: req.user!.id,
      type: "lesson",
      text: `Completed lesson: ${lesson.title}`,
      xpDelta: xpAdded,
    })

    const xpDelta = xpAdded // Declare xpDelta variable
    publishToUser(req.user!.id, { type: "xp", xpDelta, source: "lesson", totalXp: updatedUser?.xp })
    publishToUser(req.user!.id, { type: "activity", text: `Completed lesson: ${lesson.title}`, xpDelta })

    // Compute completion milestones for badges
    const [completedCount, totalLessons] = await Promise.all([
      LessonProgress.countDocuments({ user: req.user!.id, percent: 100 }),
      Lesson.countDocuments({}),
    ])

    if (completedCount === 1) newBadges.push("First Lesson")
    if (completedCount === 3) newBadges.push("Fast Learner")
    if (totalLessons > 0 && completedCount === totalLessons) newBadges.push("Lesson Master")

    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(req.user!.id, { $addToSet: { badges: { $each: newBadges } } }, { new: true })
      // Create badge activities and push SSE events
      for (const b of newBadges) {
        await Activity.create({ user: req.user!.id, type: "badge", text: `Unlocked badge: ${b}`, xpDelta: 0 })
        publishToUser(req.user!.id, { type: "badge", badge: b })
        publishToUser(req.user!.id, { type: "activity", text: `Unlocked badge: ${b}`, xpDelta: 0 })
      }
    }
  }

  return res.json(
    new ApiResponse("Progress updated", {
      lessonId,
      percent: doc.percent,
      xpAdded,
      badgesAdded: newBadges,
    }),
  )
}
