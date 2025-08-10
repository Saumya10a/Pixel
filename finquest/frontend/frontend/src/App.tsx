import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/auth-context"
import { queryClient } from "@/lib/query-client"
import MainLayout from "./layouts/MainLayout"
import Dashboard from "./pages/Dashboard"
import Learn from "./pages/Learn"
import Trade from "./pages/Trade"
import Leaderboard from "./pages/Leaderboard"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"
import RequireAuth from "./routes/require-auth"
import Login from "./pages/auth/login"
import Register from "./pages/auth/register"
import Portfolio from "./pages/Protfolio"
import WhatIf from "./pages/Whatif"

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* App */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/trade"
                element={
                  <RequireAuth>
                    <Trade />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              {/* Protected */}
              <Route
                path="/portfolio"
                element={
                  <RequireAuth>
                    <Portfolio />
                  </RequireAuth>
                }
              />
              <Route
                path="/whatif"
                element={
                  <RequireAuth>
                    <WhatIf/>
                  </RequireAuth>
                }
              />
            </Route>

            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
