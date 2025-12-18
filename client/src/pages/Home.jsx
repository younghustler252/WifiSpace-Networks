import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function Home() {
    const { theme, changeTheme } = useContext(ThemeContext);
    const [bgColor, setBgColor] = useState("#fff");

    // Function to get background based on theme
    const updateBgColor = () => {
        if (theme === "light") {
            setBgColor("#ffffff"); // light mode background
        } else if (theme === "dark") {
            setBgColor("#121212"); // dark mode background
        } else {
            // system theme
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setBgColor(isDark ? "#121212" : "#ffffff");
        }
    };

    useEffect(() => {
        updateBgColor();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => updateBgColor();
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [theme]);

    return (
        <div style={{ padding: "2rem", backgroundColor: bgColor, minHeight: "100vh", transition: "background-color 0.3s" }}>
            <h1>Theme Test Page</h1>
            <p>Current theme: <strong>{theme}</strong></p>

            <div style={{ marginTop: "1rem" }}>
                <button className="text-6xl text-blue-600" onClick={() => changeTheme("light")}>Light Mode</button>
                <button onClick={() => changeTheme("dark")} style={{ marginLeft: "1rem" }}>Dark Mode</button>
                <button onClick={() => changeTheme("system")} style={{ marginLeft: "1rem" }}>System</button>
            </div>
        </div>
    );
}
