// src/modules/account/account.module.js

import dashboardRoutes from "./routes/dashboard.routes.js";

export function dashboardModule(cradle) {
    return {
        routes: dashboardRoutes(cradle)
    };
}