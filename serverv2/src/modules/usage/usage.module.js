// ======================================================
// usage.module.js
// CLEAN AWILIX CRADLE STYLE
// ======================================================

import usageRoutes from "./presentation/routes/usage.routes.js";

export function usageModule({
    usageController,
    userRepository
}) {

    const routes = usageRoutes({
        usageController,
        userRepository
    });

    return { routes };
}