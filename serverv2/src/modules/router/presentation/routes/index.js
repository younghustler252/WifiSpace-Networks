import routerAdminRoutes from "./router-admin.routes.js";
import routerProvisioningRoutes from "./router-provisioning.routes.js";

export default function routerRoutes(deps) {
    const router = require("express").Router();

    router.use("/admin", routerAdminRoutes(deps));
    router.use("/", routerProvisioningRoutes(deps));

    return router;
}