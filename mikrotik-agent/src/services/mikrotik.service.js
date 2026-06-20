import { RouterOSAPI } from "node-routeros";

class MikrotikService {
    async executeCommand(router, command, params = []) {
        const conn = new RouterOSAPI({
            host: router.host,
            user: router.username,
            password: router.password,
            port: router.port || 8728,
            timeout: 5000
        });

        let connected = false;

        try {
            await conn.connect();
            connected = true;

            const result = await Promise.race([
                conn.write(command, params),
                this.timeout(5000, router.host)
            ]);

            return result;

        } catch (err) {
            throw new Error(
                `MikroTik command failed (${router.host}): ${err.message}`
            );

        } finally {
            if (connected) {
                await conn.close().catch(() => {});
            }
        }
    }

    timeout(ms, host) {
        return new Promise((_, reject) =>
            setTimeout(() => {
                reject(new Error(`MikroTik timeout: ${host}`));
            }, ms)
        );
    }
}

export const mikrotikService = new MikrotikService();