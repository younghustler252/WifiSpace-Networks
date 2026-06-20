// src/modules/router/router.module.js

import routerAdminRoutes from "./presentation/routes/admin.routes.js";
import routerProvisioningRoutes from "./presentation/routes/provisioning.route.js";
import agentroutes from "./presentation/routes/agent.routes.js";


export function RouterModule({
    routerAdminController,
    routerProvisioningController,
    agentController,
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

    const agentRoutes = agentroutes({
        agentController,
    });

    return {
        routes: {
            admin: adminRoutes,
            provisioning: provisioningRoutes,
            agent: agentRoutes
        }
    };
}