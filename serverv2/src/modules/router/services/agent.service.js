import crypto from "crypto";

export class AgentService {
    constructor() {
        this.agents = new Map();
        this.pendingJobs = new Map();
    }

    // ==================================================
    // REGISTER AGENT
    // ==================================================

    register(connectorId) {
        if (!connectorId) {
            throw new Error("connectorId is required");
        }

        this.agents.set(connectorId, {
            connectorId,
            registeredAt: new Date(),
            lastSeenAt: new Date(),
            pendingCommands: [],
        });

        return this.agents.get(connectorId);
    }

    heartbeat(connectorId) {
        const agent = this.agents.get(connectorId);
        if (!agent) return null;

        agent.lastSeenAt = new Date();
        return agent;
    }

    // ==================================================
    // AGENT STATUS
    // ==================================================

    getAgent(connectorId) {
        return this.agents.get(connectorId) || null;
    }

    getAllAgents() {
        return Array.from(this.agents.values());
    }

    removeAgent(connectorId) {
        return this.agents.delete(connectorId);
    }

    isOnline(connectorId) {
        const agent = this.agents.get(connectorId);
        if (!agent) return false;

        return Date.now() - agent.lastSeenAt.getTime() < 15000;
    }

    // ==================================================
    // EXECUTE COMMAND (called by MikrotikClient)
    // ==================================================

    async executeCommand(connectorId, payload) {
        const agent = this.getAgent(connectorId);

        if (!agent || !this.isOnline(connectorId)) {
            throw new Error(`Agent ${connectorId} is offline`);
        }

        const jobId = crypto.randomUUID();

        agent.pendingCommands.push({ jobId, ...payload });

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingJobs.delete(jobId);
                reject(new Error(`Job ${jobId} timed out`));
            }, 15000);

            this.pendingJobs.set(jobId, { resolve, reject, timer });
        });
    }

    // ==================================================
    // PENDING COMMANDS (called by agent polling)
    // ==================================================

    getPendingCommands(connectorId) {
        const agent = this.getAgent(connectorId);
        if (!agent) throw new Error("Agent not found");

        const commands = agent.pendingCommands;
        agent.pendingCommands = [];
        return commands;
    }

    // ==================================================
    // RESOLVE JOB (called when agent posts result back)
    // ==================================================

    resolveJob(jobId, result) {
        const pending = this.pendingJobs.get(jobId);
        if (!pending) return;

        clearTimeout(pending.timer);
        this.pendingJobs.delete(jobId);

        if (result.success) {
            pending.resolve(result.data);
        } else {
            pending.reject(new Error(result.error));
        }
    }
}