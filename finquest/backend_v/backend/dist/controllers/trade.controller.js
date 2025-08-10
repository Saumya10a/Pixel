import { z } from "zod";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Trade } from "../models/trade.js";
import { Activity } from "../models/activity.js";
import { User } from "../models/user.js";
import { publishToUser } from "../events/bus.js";
export const createTradeSchema = z.object({
    symbol: z.string().min(1).max(12),
    side: z.enum(["BUY", "SELL"]),
    price: z.number().positive(),
    qty: z.number().int().positive(),
});
export async function listTradesController(req, res) {
    const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(new ApiResponse("Trades", trades));
}
export async function createTradeController(req, res) {
    const { symbol, side, price, qty } = req.body;
    const trade = await Trade.create({
        user: req.user.id,
        symbol: symbol.toUpperCase(),
        side,
        price,
        qty,
    });
    const xpAdded = 12;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpAdded } }, { new: true });
    await Activity.create({
        user: req.user.id,
        type: "trade",
        text: `Placed a paper trade: ${trade.symbol}`,
        xpDelta: xpAdded,
    });
    publishToUser(req.user.id, {
        type: "trade",
        tradeId: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        price: trade.price,
        qty: trade.qty,
        createdAt: trade.createdAt.toISOString(),
    });
    publishToUser(req.user.id, { type: "xp", xpDelta: xpAdded, source: "trade", totalXp: updatedUser?.xp });
    publishToUser(req.user.id, { type: "activity", text: `Placed a paper trade: ${trade.symbol}`, xpDelta: xpAdded });
    return res.status(201).json(new ApiResponse("Trade submitted", trade));
}
