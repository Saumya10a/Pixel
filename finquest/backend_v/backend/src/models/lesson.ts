import { Schema, model, type Document } from "mongoose"

export interface ILesson extends Document {
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
)

export const Lesson = model<ILesson>("Lesson", lessonSchema)
