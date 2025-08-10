# FinQuest

A full-stack application with a TypeScript/Node.js backend and a Vite/React frontend.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance

---

## 🏗️ Installation Steps

You need to install dependencies in **three** places:

1. **Root backend folder**
   ```sh
   cd backend_v
   npm install
   ```

2. **Backend app folder**
   ```sh
   cd backend
   npm install
   ```

3. **Frontend app folder**
   ```sh
   cd ../../frontend/frontend
   npm install
   ```

---

## 🖥️ Backend Setup

1. **Configure environment variables:**
   - In `backend_v/backend`, create a `.env` file (see `.env.example` or the sample below):
     ```
     NODE_ENV=development
     PORT=4000
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     CORS_ORIGIN=http://localhost:5173
     ```

2. **Build the backend:**
   ```sh
   npm run build
   ```

3. **Start the backend server:**
   ```sh
   npm start
   ```
   The backend will run on [http://localhost:4000](http://localhost:4000).

---

## 💻 Frontend Setup

1. **Configure environment variables:**
   - In `frontend/frontend`, edit `.env` if needed (default API URL is `http://localhost:4000/api`).

2. **Start the frontend development server:**
   ```sh
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173).

---

## 📝 Notes

- Make sure your MongoDB Atlas cluster allows connections from your IP.
- The backend uses TypeScript and expects all local imports to use the `.js` extension (e.g., `import { env } from "./env.js";`).
- Do **not** commit your `.env` files to version control.

---

## 📂 Project Structure

```
finquest/
├── backend_v/
│   ├── node_modules/
│   └── backend/
│       ├── node_modules/
│       ├── src/
│       ├── dist/
│       ├── package.json
│       └── .env
└── frontend/
    └── frontend/
        ├── node_modules/
        ├── src/
        ├── package.json
        └── .env
```

---

## 🛠️ Useful Commands

**Backend:**
- `npm run dev` — Start backend in watch mode (development)
- `npm run build` — Build backend TypeScript
- `npm start` — Start backend server

**Frontend:**
- `npm run dev` — Start frontend in development mode

---

## 📧 Contact

For any issues, please open an issue
