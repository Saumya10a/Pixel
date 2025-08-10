import { Schema, model } from "mongoose";
const tradeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
}, { timestamps: true });
export const Trade = model("Trade", tradeSchema);
