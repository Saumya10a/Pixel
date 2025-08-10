import { createApp } from "./app.js"
import { connectDB } from "./config/db.js"
import { env } from "./config/env.js"

async function main() {
  await connectDB()
  const app = createApp()
  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Server listening on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
