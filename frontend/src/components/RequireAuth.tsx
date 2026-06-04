import type { PropsWithChildren } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/lib/auth-store";

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
