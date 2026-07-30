 // src/modules/router/router.module.js

import routerRoutes from "./presentation/routes/router.routes.js";


export function RouterModule({
    routerController,
    permissionService,
    userRepository
}) {

    const routes = routerRoutes({
        routerController,
        permissionService,
        userRepository
    });


    return {
        routes
    };
}