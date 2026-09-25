// src/App.tsx
import { lazy, Suspense } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom" // 1. Import HashRouter
import { ProtectedRoute } from "@/components/routing/ProtectedRoute"

const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })))
const Login = lazy(() => import("@/pages/Login").then(m => ({ default: m.Login })))
const SignUp = lazy(() => import("@/pages/SignUp").then(m => ({ default: m.SignUp })))

export function App() {
  return (
    <HashRouter> {/* 2. Use HashRouter instead of BrowserRouter */}
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-muted-foreground">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App