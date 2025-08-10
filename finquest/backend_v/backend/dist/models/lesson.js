import { Schema, model } from "mongoose";
const lessonSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
}, { timestamps: true });
export const Lesson = model("Lesson", lessonSchema);
