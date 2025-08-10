import { connectDB } from "../config/db.js";
import { Lesson } from "../models/lesson.js";
async function run() {
    await connectDB();
    const count = await Lesson.countDocuments();
    if (count > 0) {
        console.log("Lessons already exist, skipping seed.");
        process.exit(0);
    }
    await Lesson.insertMany([
        { title: "Compound Interest", description: "Master exponential growth of money." },
        { title: "Risk & Volatility", description: "Know your risk buckets." },
        { title: "Market Microstructure", description: "Order books demystified." },
        { title: "Options Basics", description: "Calls, puts, and payoffs." },
    ]);
    console.log("✅ Seeded lessons.");
    process.exit(0);
}
run();
