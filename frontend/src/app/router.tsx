import { Navigate, createBrowserRouter } from "react-router-dom";

import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { PointsPage } from "@/pages/PointsPage";
import { RedeemOrdersPage } from "@/pages/RedeemOrdersPage";
import { RewardsPage } from "@/pages/RewardsPage";
import { TasksPage } from "@/pages/TasksPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "points",
        element: <PointsPage />,
      },
      {
        path: "rewards",
        element: <RewardsPage />,
      },
      {
        path: "redeem-orders",
        element: <RedeemOrdersPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
