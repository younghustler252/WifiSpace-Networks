const { runCommand } = require('../config/routeros');

// --------------------------------------------------
//  Format RouterOS hotspot user
// --------------------------------------------------
function formatUser(u) {
    return {
        id: u['.id'],
        username: u.name,
        profile: u.profile || null,
        disabled: u.disabled === "true",
        uptime: u.uptime || "0s",
        bytesIn: Number(u["bytes-in"] || 0),
        bytesOut: Number(u["bytes-out"] || 0),
        mac: u["mac-address"] || null,
        comment: u.comment || null,   // SHOULD BE MongoDB userId
        dynamic: u.dynamic === "true"
    };
}

// --------------------------------------------------
//  Find RouterOS internal ID (.id) by username
// --------------------------------------------------
async function findUserId(username) {
    const users = await runCommand(['/ip/hotspot/user/print']);

    // Exact match ignoring case
    const match = users.find(
        u => (u.name || "").toLowerCase() === username.toLowerCase()
    );

    return match ? match[".id"] : null;
}

// --------------------------------------------------
//  Find RouterOS user by MongoDB userId (via comment field)
// --------------------------------------------------
async function findUserByMongoId(mongoUserId) {
    const users = await runCommand(['/ip/hotspot/user/print']);

    const match = users.find(
        u => (u.comment || "").toString() === mongoUserId.toString()
    );

    return match ? formatUser(match) : null;
}

// --------------------------------------------------
//  Get all hotspot users (non-dynamic only)
// --------------------------------------------------
async function getHotspotUsers() {
    try {
        const raw = await runCommand(['/ip/hotspot/user/print']);

        return raw
            .filter(u => u.dynamic !== "true")  // ignore dynamic/temporary users
            .map(formatUser);

    } catch (err) {
        console.error("❌ Error fetching RouterOS users:", err);
        throw new Error("Failed to fetch RouterOS users.");
    }
}

async function getRouterProfiles() {
    try {
        // This command fetches all user profiles
        const rawProfiles = await runCommand(['/ip/hotspot/user/profile/print']);

        // Map to just profile names
        const profiles = rawProfiles.map(p => p.name);

        return profiles;
    } catch (err) {
        console.error("❌ Error fetching RouterOS profiles:", err);
        throw new Error("Failed to fetch RouterOS profiles.");
    }
}

// --------------------------------------------------
//  Add hotspot user (MUST store mongoUserId in comment)
// --------------------------------------------------
async function addHotspotUser(username, password, profile = "default", mongoUserId) {
    try {
        await runCommand([
            '/ip/hotspot/user/add',
            `=name=${username}`,
            `=password=${password}`,
            `=profile=${profile}`,
            `=comment=${mongoUserId}`
        ]);

        return { success: true, message: "User added to MikroTik." };

    } catch (err) {
        console.error("❌ Error adding hotspot user:", err);
        throw new Error("Failed to add hotspot user.");
    }
}

// --------------------------------------------------
//  Update password
// --------------------------------------------------
async function updateHotspotPassword(username, newPassword) {
    try {
        const id = await findUserId(username);
        if (!id) throw new Error("User not found in RouterOS");

        await runCommand([
            '/ip/hotspot/user/set',
            `=.id=${id}`,
            `=password=${newPassword}`
        ]);

        return { success: true, message: "Password updated." };

    } catch (err) {
        console.error("❌ Error updating password:", err);
        throw new Error("Failed to update hotspot password.");
    }
}

// --------------------------------------------------
//  Update profile (speed plan)
// --------------------------------------------------
async function updateHotspotProfile(username, profile) {
    try {
        const id = await findUserId(username);
        if (!id) throw new Error("User not found in RouterOS");

        await runCommand([
            '/ip/hotspot/user/set',
            `=.id=${id}`,
            `=profile=${profile}`
        ]);

        return { success: true, message: "Profile updated." };

    } catch (err) {
        console.error("❌ Error updating profile:", err);
        throw new Error("Failed to update hotspot profile.");
    }
}

// --------------------------------------------------
//  Disable user (account suspension)
// --------------------------------------------------
async function disableHotspotUser(username) {
    try {
        const id = await findUserId(username);
        if (!id) throw new Error("User not found in RouterOS");

        await runCommand([
            '/ip/hotspot/user/disable',
            `=.id=${id}`
        ]);

        return { success: true, message: "User disabled." };

    } catch (err) {
        console.error("❌ Error disabling user:", err);
        throw new Error("Failed to disable hotspot user.");
    }
}

// --------------------------------------------------
//  Enable user (reactivate account)
// --------------------------------------------------
async function enableHotspotUser(username) {
    try {
        const id = await findUserId(username);
        if (!id) throw new Error("User not found in RouterOS");

        await runCommand([
            '/ip/hotspot/user/enable',
            `=.id=${id}`
        ]);

        return { success: true, message: "User enabled." };

    } catch (err) {
        console.error("❌ Error enabling user:", err);
        throw new Error("Failed to enable hotspot user.");
    }
}

// --------------------------------------------------
//  Get active hotspot sessions
// --------------------------------------------------
async function getActiveUsers() {
    try {
        const sessions = await runCommand(['/ip/hotspot/active/print']);

        return sessions.map(s => ({
            id: s['.id'],
            username: s.user,
            address: s.address,
            mac: s['mac-address'],
            uptime: s.uptime,
            bytesIn: Number(s['bytes-in'] || 0),
            bytesOut: Number(s['bytes-out'] || 0),
            loginBy: s['login-by']
        }));

    } catch (err) {
        console.error("❌ Error fetching active users:", err);
        throw new Error("Failed to fetch active hotspot sessions.");
    }
}

// --------------------------------------------------
//  Disconnect (kick) active session
// --------------------------------------------------
async function kickUserSession(sessionId) {
    try {
        await runCommand([
            '/ip/hotspot/active/remove',
            `=.id=${sessionId}`
        ]);

        return { success: true, message: "User session kicked." };

    } catch (err) {
        console.error("❌ Error kicking session:", err);
        throw new Error("Failed to kick user session.");
    }
}

async function checkHotspotUser(username) {
    const users = await runCommand(['/ip/hotspot/user/print', `?name=${username}`]);
    return Array.isArray(users) && users.length > 0;
}

async function getAllHotspotUsers() {
    const conn = await runCommand();

    const users = await conn.write('/ip/hotspot/user/print');

    return users.map(u => ({
        name: u.name,
        password: u.password,
        profile: u.profile,
    }));
}

// --------------------------------------------------
//  Exports
// --------------------------------------------------
module.exports = {
    getHotspotUsers,
    getRouterProfiles,
    addHotspotUser,
    updateHotspotPassword,
    updateHotspotProfile,
    disableHotspotUser,
    enableHotspotUser,
    getActiveUsers,
    kickUserSession,
    findUserId,
    findUserByMongoId,
    checkHotspotUser,
    getAllHotspotUsers
};
