import dotenv from "dotenv";

dotenv.config();

export const config = {
    backendUrl: process.env.BACKEND_URL,
    connectorId: process.env.CONNECTOR_ID,
    apiKey: process.env.API_KEY,
};