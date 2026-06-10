// src/modules/router/router.module.js

import routerAdminRoutes from "./presentation/routes/admin.routes.js";
import routerProvisioningRoutes from "./presentation/routes/provisioning.route.js";

export function RouterModule({
    routerAdminController,
    routerProvisioningController,
    permissionService,
    userRepository
}) {
    const adminRoutes = routerAdminRoutes({
        routerAdminController,
        permissionService,
        userRepository
    });

    const provisioningRoutes = routerProvisioningRoutes({
        routerProvisioningController,
        permissionService,
        userRepository
    });

    return {
        routes: {
            admin: adminRoutes,
            provisioning: provisioningRoutes
        }
    };
}