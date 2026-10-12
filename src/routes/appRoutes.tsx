import { createBrowserRouter } from "react-router-dom";


import Home from "@/pages/home/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyEmail from "@/pages/auth/verify-email";
import Dashboard from "@/pages/dashboard/dashboard";
import Projects from "@/pages/projects/projects";
import Settings from "@/pages/settings/settings";
import ApiKeys from "@/pages/settings/apiKeys";
import Appearance from "@/pages/settings/appearance";
import Security from "@/pages/settings/security";
import AuthLayout from "@/layouts/authLayout";
import MainLayout from "@/layouts/mainLayout";
import Profile from "@/pages/profile/profile";
import MyPlan from "@/pages/pricing/myPlan";
import Pricing from "@/pages/pricing/pricing";
import Support from "@/pages/support/support";


const router = createBrowserRouter([

    {
        path: "/",
        element: <Home />,
    },

    {
        element: <AuthLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/verify-email",
                element: <VerifyEmail />,
            },
        ],
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/projects",
                element: <Projects />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/my-plan",
                element: <MyPlan />,
            },
            {
                path: "/pricing",
                element: <Pricing />,
            },
            {
                path: "/support",
                element: <Support />,
            },
            {
                path: "/settings",
                element: <Settings />,
                children: [
                    {
                        index: true,
                        path: "appearance",
                        element: <Appearance />,
                    },
                    {
                        path: "security",
                        element: <Security />,
                    },
                    {
                        path: "api-keys",
                        element: <ApiKeys />,
                    },
                ],
            },
        ],
    },
]);

export default router;