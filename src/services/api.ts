import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "",
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const url = config.url ?? "";
    if (url.startsWith("/v1/") && apiKey) {
        config.headers.set("X-API-Key", apiKey);
    }

    return config;
});

export default api;