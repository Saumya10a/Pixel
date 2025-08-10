import { Schema, model, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  avatarUrl?: string
  xp: number
  streak: number
  badges: string[]
  rankPercent: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 64 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    rankPercent: { type: Number, default: 100 },
  },
  { timestamps: true },
)

userSchema.index({ email: 1 }, { unique: true })

export const User = model<IUser>("User", userSchema)
