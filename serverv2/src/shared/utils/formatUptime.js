export function toSeconds(value, unit) {
    switch (unit) {
        case "minutes":
            return value * 60;
        case "hours":
            return value * 3600;
        case "days":
            return value * 86400;
        case "months":
            return value * 2592000; // 30 days
        default:
            return value * 86400;
    }
}
export function formatUptime(seconds) {
    if (!seconds || seconds <= 0) return null;

    if (seconds % 604800 === 0) return `${seconds / 604800}w`; // weeks
    if (seconds % 86400 === 0) return `${seconds / 86400}d`;     // days
    if (seconds % 3600 === 0) return `${seconds / 3600}h`;       // hours
    if (seconds % 60 === 0) return `${seconds / 60}m`;           // minutes
    return `${seconds}s`;                                        // seconds
}