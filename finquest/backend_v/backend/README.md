# Finquest Backend (Node.js + Express + MongoDB)

Production-ready backend for Finquest with authentication, user stats, lessons/progress, trades, activity feed, and leaderboard.

## Tech
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Auth
- Zod validation
- Security: helmet, CORS, rate-limit, express-mongo-sanitize, xss-clean
- Logging: morgan

## Endpoints (prefix: /api)
Auth
- POST /auth/register { name, email, password }
- POST /auth/login { email, password }
- GET /auth/me (auth)

Users
- GET /users/me/stats (auth)
- PATCH /users/me { name } (auth)

Lessons
- GET /lessons (auth) → lessons with your progress
- PATCH /lessons/:lessonId/progress { percent } (auth) → awards +50 XP on first 100%

Trades
- GET /trades (auth)
- POST /trades { symbol, side: BUY|SELL, price, qty } (auth) → awards +12 XP

Leaderboard
- GET /leaderboard/top?limit=10

## Getting Started

1) Prerequisites
- Node 18+ and MongoDB running locally or Atlas
2) Configure environment
- Copy backend/.env.example to backend/.env and fill values:
  - MONGO_URI
  - JWT_SECRET
  - PORT (default 4000)
  - CORS_ORIGIN (your SPA URL, e.g., http://localhost:5173)

3) Install and run
- cd backend
- npm install
- npm run seed:lessons   # one-time seed
- npm run dev            # starts http://localhost:4000

4) Quick test (replace TOKEN after login)
- Register:
  curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Alex","email":"alex@example.com","password":"secret123"}'
- Login:
  curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alex@example.com","password":"secret123"}'
- Me:
  curl http://localhost:4000/api/auth/me -H "Authorization: Bearer TOKEN"
- Lessons:
  curl http://localhost:4000/api/lessons -H "Authorization: Bearer TOKEN"
- Update progress:
  curl -X PATCH http://localhost:4000/api/lessons/LESSON_ID/progress -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"percent":100}'
- Create trade:
  curl -X POST http://localhost:4000/api/trades -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"symbol":"AAPL","side":"BUY","price":103.25,"qty":10}'
- Leaderboard:
  curl http://localhost:4000/api/leaderboard/top

## Connecting the React Frontend

1) Set your frontend environment
- Vite (typical):
  - Create a .env file in your SPA root: VITE_API_URL=http://localhost:4000/api

2) Add a small API helper (example)
- Create src/lib/api.ts in your frontend:

  export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  function getToken() {
    return localStorage.getItem("token");
  }

  async function request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as any) };
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const res = await fetch(API_URL + path, { ...options, headers });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = json?.message || "Request failed";
      throw new Error(msg);
    }
    return json;
  }

  export const api = {
    // auth
    register: (body: { name: string; email: string; password: string }) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: async (body: { email: string; password: string }) => {
      const data = await request("/auth/login", { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("token", data.data.token);
      return data;
    },
    me: () => request("/auth/me"),

    // user
    myStats: () => request("/users/me/stats"),
    updateMe: (body: { name: string }) => request("/users/me", { method: "PATCH", body: JSON.stringify(body) }),

    // lessons
    lessons: () => request("/lessons"),
    setProgress: (lessonId: string, percent: number) =>
      request(`/lessons/${lessonId}/progress`, { method: "PATCH", body: JSON.stringify({ percent }) }),

    // trades
    trades: () => request("/trades"),
    createTrade: (trade: { symbol: string; side: "BUY" | "SELL"; price: number; qty: number }) =>
      request("/trades", { method: "POST", body: JSON.stringify(trade) }),

    // leaderboard
    top: (limit = 10) => request(`/leaderboard/top?limit=${limit}`)
  };

3) Example usage in your pages
- Dashboard (load stats and activity):
  useEffect(() => {
    api.myStats().then(({ data }) => {
      // data: { xp, streak, badges, rankPercent, activities }
      // update your state here
    }).catch(console.error);
  }, []);

- Learn (pull lessons; update progress):
  useEffect(() => {
    api.lessons().then(({ data }) => setLessons(data)).catch(console.error);
  }, []);
  // on complete:
  await api.setProgress(lessonId, 100);

- Trade (submit a trade):
  await api.createTrade({ symbol, side, price: Number(price), qty: Number(qty) });

- Leaderboard:
  useEffect(() => {
    api.top(10).then(({ data }) => setTop(data)).catch(console.error);
  }, []);

4) Auth flow
- On login, save token (already done above).
- Add a logout:
  function logout() { localStorage.removeItem("token"); window.location.href = "/"; }

5) CORS
- Ensure backend CORS_ORIGIN matches your frontend dev server (e.g., http://localhost:5173).

## Deploying
- Provision MongoDB (Atlas).
- Set environment variables on your hosting (MONGO_URI, JWT_SECRET, PORT, CORS_ORIGIN).
- Build and start: npm run build && npm start.

## Folder Structure
backend/
  src/
    config/       # env, db, cors
    controllers/  # route handlers
    middleware/   # auth, error, validate
    models/       # Mongoose models
    routes/       # Express routers
    seed/         # seeding utilities
    utils/        # helpers
    app.ts        # express app wiring
    server.ts     # boot
  package.json
  tsconfig.json
  .env.example
  README.md
