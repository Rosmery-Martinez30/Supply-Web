import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const { token } = useAuthStore();

  // Si no hay token → redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
