import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/react-app/context/AuthContext";
import Layout from "@/react-app/components/Layout";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import Dashboard from "@/react-app/pages/Dashboard";
import Workouts from "@/react-app/pages/Workouts";
import Exercises from "@/react-app/pages/Exercises";
import Metrics from "@/react-app/pages/Metrics";
import Photos from "@/react-app/pages/Photos";
import Reports from "@/react-app/pages/Reports";
import Goals from "@/react-app/pages/Goals";
import Recommendations from "@/react-app/pages/Recommendations";
import Profile from "@/react-app/pages/Profile";
import Login from "@/react-app/pages/Login";
import Register from "@/react-app/pages/Register";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/metrics" element={<Metrics />} />
                    <Route path="/photos" element={<Photos />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/app/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
