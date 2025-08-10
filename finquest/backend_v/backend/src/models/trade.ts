import { Schema, model, type Document, type Types } from "mongoose"

export type TradeSide = "BUY" | "SELL"

export interface ITrade extends Document {
  user: Types.ObjectId
  symbol: string
  side: TradeSide
  price: number
  qty: number
  createdAt: Date
  updatedAt: Date
}

const tradeSchema = new Schema<ITrade>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
)

export const Trade = model<ITrade>("Trade", tradeSchema)
