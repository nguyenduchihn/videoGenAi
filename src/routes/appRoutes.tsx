import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@/layouts/authLayout";
import MainLayout from "@/layouts/mainLayout";
import RootLayout from "@/layouts/rootLayout";
import ForgotPassword from "@/pages/auth/forgot-password";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ResetPassword from "@/pages/auth/reset-password";
import VerifyEmail from "@/pages/auth/verify-email";
import NotFound from "@/pages/notFound";

// Trang nặng tách chunk riêng; Suspense + popup tải đặt ở RootLayout.
const Home = lazy(() => import("@/pages/home/home"));
const Dashboard = lazy(() => import("@/pages/dashboard/dashboard"));
const Projects = lazy(() => import("@/pages/projects/projects"));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));
const BillingPage = lazy(() => import("@/features/billing/BillingPage"));
const TasksPage = lazy(() => import("@/features/tasks/TasksPage"));
const Pricing = lazy(() => import("@/pages/pricing/pricing"));
const Support = lazy(() => import("@/pages/support/support"));
const Settings = lazy(() => import("@/pages/settings/settings"));
const Appearance = lazy(() => import("@/pages/settings/appearance"));
const Security = lazy(() => import("@/pages/settings/security"));
const ApiKeys = lazy(() => import("@/pages/settings/apiKeys"));

const RouteErrorPage = lazy(() => import("./RouteErrorPage"));

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/welcome", element: <Navigate to="/dashboard" replace /> },
            {
                element: <AuthLayout />,
                children: [
                    { path: "/login", element: <Login /> },
                    { path: "/register", element: <Register /> },
                    { path: "/verify-email", element: <VerifyEmail /> },
                    { path: "/forgot-password", element: <ForgotPassword /> },
                    { path: "/reset-password", element: <ResetPassword /> },
                ],
            },
            {
                element: <MainLayout />,
                children: [
                    { path: "/dashboard", element: <Dashboard /> },
                    { path: "/projects", element: <Projects /> },
                    { path: "/profile", element: <ProfilePage /> },
                    { path: "/my-plan", element: <Navigate to="/billing" replace /> },
                    { path: "/pricing", element: <Pricing /> },
                    { path: "/billing", element: <BillingPage /> },
                    { path: "/tasks", element: <TasksPage /> },
                    { path: "/support", element: <Support /> },
                    {
                        path: "/settings",
                        element: <Settings />,
                        children: [
                            { index: true, element: <Navigate to="appearance" replace /> },
                            { path: "appearance", element: <Appearance /> },
                            { path: "security", element: <Security /> },
                            { path: "api-keys", element: <ApiKeys /> },
                        ],
                    },
                ],
            },
            { path: "*", element: <NotFound /> },
        ],
    },
]);

export default router;
