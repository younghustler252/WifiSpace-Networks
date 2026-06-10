import { hotspotRoutes } from "./routes/hotspot.routes.js";

export function hotspotModule({ hotspotController }) {
    const routes = hotspotRoutes({
        hotspotController,
    });

    return { routes };
}