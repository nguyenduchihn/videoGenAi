import { useEffect } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthInitializer() {
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    useEffect(() => {
        let active = true;

        const initializeAuth = async () => {
            setLoading(true);

            try {
                const user = await authService.me();

                if (active) {
                    setUser(user);
                }
            } catch {
                if (active) {
                    clearUser();
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void initializeAuth();

        return () => {
            active = false;
        };
    }, [setUser, clearUser, setLoading]);

    return null;
}
