import React from "react";

const StatsCard = ({ title, value, icon, color = "bg-accent/10 text-accent", onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`card card-hover flex flex-col justify-between p-6 cursor-pointer transition-transform duration-200 hover:scale-105`}
        >
            {/* Icon */}
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${color} mb-4`}>
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-secondary">{title}</h3>

            {/* Value */}
            <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
        </div>
    );
};

export default StatsCard;
