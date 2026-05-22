import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ roles }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
