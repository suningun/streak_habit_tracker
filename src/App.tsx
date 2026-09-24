import { ProtectedRoute } from "@/components/routing/ProtectedRoute"
import { Dashboard } from "@/pages/Dashboard"
import { Login } from "@/pages/Login"
import { SignUp } from "@/pages/SignUp"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
