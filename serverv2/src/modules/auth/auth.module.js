import authRoutes from "./presentation/routes/auth.routes.js";

export function authModule({ authController, permissionService }) {

  const routes = authRoutes({
    authController,
    permissionService,
  
  });
  return { routes };
}