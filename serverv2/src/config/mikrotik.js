export const mikrotikConfig = {
	host: process.env.MIKROTIK_HOST || "192.168.88.1",
	user: process.env.MIKROTIK_USER || "admin",
	password: process.env.MIKROTIK_PASS || "password",
	port: Number(process.env.MIKROTIK_PORT) || 8728,
};