import axios from "axios";
import { config } from "../config.js";
class BackendService {

    async register() {
        return axios.post(`${config.backendUrl}/api/agents/register`, {
            connectorId: config.connectorId,
            apiKey: config.apiKey
        });
    }

    async heartbeat() {
        return axios.post(`${config.backendUrl}/api/agents/heartbeat`, {
            connectorId: config.connectorId,
            apiKey: config.apiKey
        });
    }

    async fetchPendingCommands() {
        const res = await axios.get(
            `${config.backendUrl}/api/agents/commands/pending`,
            {
                params: { connectorId: config.connectorId },
                headers: { "x-api-key": config.apiKey }
            }
        );
        return res.data.data; // array of { jobId, router, command, params }
    }

    async postResult(jobId, result) {
        return axios.post(`${config.backendUrl}/api/agents/commands/result`, {
            connectorId: config.connectorId,
            apiKey: config.apiKey,
            jobId,
            result
        });
    }
}
export const backendService = new BackendService();