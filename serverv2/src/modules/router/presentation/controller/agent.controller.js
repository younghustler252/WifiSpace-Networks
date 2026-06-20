export class AgentController {
    constructor({ agentService, agentConfig }) {
        this.agentService = agentService;
        this.agentConfig = agentConfig;
    }

    // Agent registers itself on startup
    register = async (req, res, next) => {
        try {
            const { connectorId } = req.body;
            if (!connectorId) return res.status(400).json({ success: false, message: "connectorId is required" });

            const agent = this.agentService.register(connectorId);
            return res.json({ success: true, data: agent });
        } catch (err) { next(err); }
    };

    // Agent keeps itself alive
    heartbeat = async (req, res, next) => {
        try {
            const { connectorId, apiKey } = req.body;
            if (apiKey !== this.agentConfig.apiKey) return res.status(401).json({ success: false, message: "Unauthorized" });

            const agent = this.agentService.heartbeat(connectorId);
            if (!agent) return res.status(404).json({ success: false, message: "Agent not registered" });

            return res.json({ success: true, data: agent });
        } catch (err) { next(err); }
    };

    // Agent polls for pending jobs
    getPendingCommands = async (req, res, next) => {
        try {
            const { connectorId } = req.query;
            const apiKey = req.headers["x-api-key"];

            if (apiKey !== this.agentConfig.apiKey) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!connectorId) return res.status(400).json({ success: false, message: "connectorId is required" });

            const commands = this.agentService.getPendingCommands(connectorId);
            return res.json({ success: true, data: commands });
        } catch (err) { next(err); }
    };

    // Agent posts result back
    postResult = async (req, res, next) => {
        try {
            const { connectorId, apiKey, jobId, result } = req.body;

            if (apiKey !== this.agentConfig.apiKey) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });
            if (!result) return res.status(400).json({ success: false, message: "result is required" });

            this.agentService.resolveJob(jobId, result);
            return res.json({ success: true });
        } catch (err) { next(err); }
    };
}