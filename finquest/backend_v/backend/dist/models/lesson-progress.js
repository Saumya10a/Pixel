import { Schema, model } from "mongoose";
const lessonProgressSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    percent: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true });
lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
export const LessonProgress = model("LessonProgress", lessonProgressSchema);
