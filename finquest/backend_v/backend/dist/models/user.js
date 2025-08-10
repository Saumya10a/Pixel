import { Schema, model } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 64 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    rankPercent: { type: Number, default: 100 },
}, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true });
export const User = model("User", userSchema);
