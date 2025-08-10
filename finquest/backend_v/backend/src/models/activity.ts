import { Schema, model, type Document, type Types } from "mongoose"

export type ActivityType = "lesson" | "trade" | "badge" | "challenge"

export interface IActivity extends Document {
  user: Types.ObjectId
  type: ActivityType
  text: string
  meta?: string
  xpDelta?: number
  createdAt: Date
  updatedAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["lesson", "trade", "badge", "challenge"], required: true },
    text: { type: String, required: true },
    meta: { type: String },
    xpDelta: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Activity = model<IActivity>("Activity", activitySchema)
