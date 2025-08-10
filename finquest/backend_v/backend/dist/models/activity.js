import { Schema, model } from "mongoose";
const activitySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["lesson", "trade", "badge", "challenge"], required: true },
    text: { type: String, required: true },
    meta: { type: String },
    xpDelta: { type: Number, default: 0 },
}, { timestamps: true });
export const Activity = model("Activity", activitySchema);
