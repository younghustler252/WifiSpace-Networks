// components/ui/Avatar.jsx
import React from "react";

const Avatar = ({
    firstName = "",
    lastName = "",
    src = null,
    size = 64,
    className = ""
}) => {

    const initials = (firstName[0] || "") + (lastName[0] || "");
    const fallback = initials.toUpperCase() || "?";

    const dimension = { width: size, height: size };

    return src ? (
        <img
            src={src}
            alt={`${firstName} ${lastName}`.trim() || "User Avatar"}
            loading="lazy"
            draggable={false}
            className={`rounded-full object-cover ${className}`}
            style={dimension}
        />
    ) : (
        <div
            className={`rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold select-none ${className}`}
            style={dimension}
        >
            {fallback}
        </div>
    );
};

export default Avatar;
