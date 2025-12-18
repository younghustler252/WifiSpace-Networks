import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth(); // get current logged-in user
    const { updateDetails } = useUser(); // mutation to update user details
    const [theme, setTheme] = useState("system");

    const applyTheme = (mode) => {
        document.documentElement.setAttribute("data-theme", mode);
    };

    const detectSystemTheme = () =>
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    useEffect(() => {
        const initializeTheme = () => {
            // Get backend theme if user exists
            const backendTheme = user?.themePreference;
            // fallback to localStorage or system
            const savedTheme = backendTheme || localStorage.getItem("theme") || "system";
            setTheme(savedTheme);
            applyTheme(savedTheme === "system" ? detectSystemTheme() : savedTheme);
            localStorage.setItem("theme", savedTheme);
        };

        initializeTheme();

        // Listen to system theme changes
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => {
            const currentTheme = localStorage.getItem("theme") || "system";
            if (currentTheme === "system") applyTheme(detectSystemTheme());
        };
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [user]);

    const changeTheme = useCallback(
        (newTheme) => {
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme === "system" ? detectSystemTheme() : newTheme);

            // Update backend only if user exists
            if (user) {
                updateDetails.mutate({ themePreference: newTheme });
            }
        },
        [user, updateDetails]
    );

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
