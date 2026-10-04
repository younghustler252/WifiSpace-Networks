// routes/ticket.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { container } from "../../../container/index.js";
import { requireStaff } from "../../../infrastructure/middleware/rbac.middleware.js";

const router = Router();
const authenticate = container.resolve("authenticate");
const ticketController = container.resolve("ticketController");
const adminController = container.resolve("ticketAdminController");

router.use(authenticate);
router.post("/", asyncHandler(ticketController.createTicket));
router.get("/me", asyncHandler(ticketController.getMyTickets));
router.get("/:id", asyncHandler(ticketController.getTicketById));
router.post("/:id/reply", asyncHandler(ticketController.reply));

const adminRouter = Router();
adminRouter.use(requireStaff);
adminRouter.get("/", asyncHandler(adminController.getAllTickets));
adminRouter.patch("/:id/assign", asyncHandler(adminController.assign));
adminRouter.patch("/:id/status", asyncHandler(adminController.updateStatus));
router.use("/admin", adminRouter);

export default router;