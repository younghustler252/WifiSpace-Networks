// components/ProfileCard.js
import React from "react";
import { getInitials } from "../utils/formatters";

const ProfileCard = ({ user }) => {
    const initials = getInitials(user.firstName, user.lastName, user.email);
    return (
        <div className="bg-surface border border-surface rounded-lg p-6 flex items-center gap-6">
            {user.profilePicture ? (
                <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                />
            ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {initials}
                </div>
            )}
            <div>
                <p className="text-xl font-bold">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-500">Status: {user.subscriptionStatus}</p>
                <p className="text-gray-500">WSN ID: {user.wsnId || "N/A"}</p>
                <p className="text-gray-400 text-sm">Last seen: {user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "N/A"}</p>
            </div>
        </div>
    );
};

export default ProfileCard;
