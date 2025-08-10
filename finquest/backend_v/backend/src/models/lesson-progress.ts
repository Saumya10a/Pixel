import { Schema, model, type Document, type Types } from "mongoose"

export interface ILessonProgress extends Document {
  user: Types.ObjectId
  lesson: Types.ObjectId
  percent: number // 0..100
  updatedAt: Date
  createdAt: Date
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    percent: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true },
)

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true })

export const LessonProgress = model<ILessonProgress>("LessonProgress", lessonProgressSchema)
