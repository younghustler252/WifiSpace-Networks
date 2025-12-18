// components/ui/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value, icon, color }) => {
    return (
        <div
            className={`flex items-center p-5 rounded-xl shadow-md bg-surface border border-surface hover:shadow-lg transition-all duration-200`}
        >
            <div className={`p-3 rounded-full text-white ${color} mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-lg font-semibold text-primary">{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
