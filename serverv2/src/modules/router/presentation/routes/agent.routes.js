import { Router } from "express";
import asyncHandler from "express-async-handler";

export default function agentRoutes({ agentController }) {
    const router = Router();

    // Agent registers on startup
    router.post(
        "/register",
        asyncHandler((req, res, next) =>
            agentController.register(req, res, next)
        )
    );

    // Agent heartbeat
    router.post(
        "/heartbeat",
        asyncHandler((req, res, next) =>
            agentController.heartbeat(req, res, next)
        )
    );

    // Agent polls for pending jobs
    router.get(
        "/commands/pending",
        asyncHandler((req, res, next) =>
            agentController.getPendingCommands(req, res, next)
        )
    );

    // Agent posts result back
    router.post(
        "/commands/result",
        asyncHandler((req, res, next) =>
            agentController.postResult(req, res, next)
        )
    );

    return router;
}