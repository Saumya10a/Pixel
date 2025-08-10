import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.js";
export async function leaderboardTopController(req, res) {
    const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || "10"), 10), 1), 50);
    const users = await User.find({}, { name: 1, xp: 1, rankPercent: 1 }).sort({ xp: -1 }).limit(limit).lean();
    return res.json(new ApiResponse("Top users", users.map((u) => ({ id: String(u._id), name: u.name, xp: u.xp, rankPercent: u.rankPercent }))));
}
