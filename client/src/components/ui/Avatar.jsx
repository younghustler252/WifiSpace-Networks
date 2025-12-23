import React from "react";

// Helper: Generate consistent color based on string
const stringToColor = (str) => {
    if (!str) return "#6366f1"; // default indigo
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += (`00${value.toString(16)}`).slice(-2);
    }
    return color;
};

const Avatar = ({
    firstName = "",
    lastName = "",
    src = null,
    size = 64,
    className = "",
    border = true
}) => {
    const initials = (firstName[0] || "") + (lastName[0] || "");
    const fallback = initials.toUpperCase() || "?";
    const dimension = { width: size, height: size };

    const bgColor = stringToColor(firstName + lastName);

    const borderClass = border ? "border border-surface dark:border-gray-700" : "";

    return src ? (
        <img
            src={src}
            alt={`${firstName} ${lastName}`.trim() || "User Avatar"}
            title={`${firstName} ${lastName}`.trim() || "User"}
            loading="lazy"
            draggable={false}
            className={`rounded-full object-cover transition-all ${borderClass} ${className}`}
            style={dimension}
        />
    ) : (
        <div
            title={`${firstName} ${lastName}`.trim() || "User"}
            className={`rounded-full flex items-center justify-center font-bold select-none transition-all text-white ${borderClass} ${className}`}
            style={{ ...dimension, backgroundColor: bgColor }}
        >
            {fallback}
        </div>
    );
};

export default Avatar;
