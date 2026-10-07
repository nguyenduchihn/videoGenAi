import { createBrowserRouter } from "react-router-dom";


import Home from "@/pages/home/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyEmail from "@/pages/auth/verify-email";

import Dashboard from "@/pages/dashboard/dashboard";
import Projects from "@/pages/projects/projects";

import Settings from "@/pages/settings/settings";
import Account from "@/pages/settings/account";
import ApiKeys from "@/pages/settings/apiKeys";
import Appearance from "@/pages/settings/appearance";
import Notifications from "@/pages/settings/notifications";
import Security from "@/pages/settings/security";
import AuthLayout from "@/layouts/authLayout";
import MainLayout from "@/layouts/mainLayout";


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
                path: "/settings",
                element: <Settings />,
                children: [
                    {
                        index: true,
                        element: <Account />,
                    },
                    {
                        path: "appearance",
                        element: <Appearance />,
                    },
                    {
                        path: "notifications",
                        element: <Notifications />,
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