import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import router from "./router/index.js";
import { errorMiddleware } from "./infrastructure/middleware/error.middleware.js";
import { NotFoundError } from "./shared/errors/domain.errors.js";

const app = express();

/**
 * Trust proxy
 *
 * Required when running behind Nginx/reverse proxy so Express
 * can correctly identify the client IP and protocol.
 */
app.set("trust proxy", 1);

/**
 * Security headers
 */
app.use(
	helmet({
		crossOriginResourcePolicy: false
	})
);

/**
 * Request body parsing
 *
 * Keep the JSON limit reasonably small to prevent unnecessarily
 * large request bodies from consuming server resources.
 *
 * Increase this only for endpoints that genuinely need larger payloads.
 */
app.use(
	express.json({
		limit: "1mb",
		verify: (req, res, buf) => {
			req.rawBody = buf;
		}
	})
);

app.use(
	express.urlencoded({
		extended: true,
		limit: "1mb"
	})
);

/**
 * Cookies
 */
app.use(cookieParser());

/**
 * CORS
 */
const allowedOrigins = process.env.CORS_ORIGIN
	?.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow non-browser requests such as curl/server-to-server calls.
			if (!origin) {
				return callback(null, true);
			}

			// If no origins are configured, reject browser cross-origin requests.
			if (!allowedOrigins?.length) {
				return callback(new Error("CORS origin not allowed"));
			}

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error("CORS origin not allowed"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		exposedHeaders: ["Idempotent-Replayed", "Retry-After"]
	})
);

/**
 * HTTP request logging
 *
 * Production logs should be handled by your process manager /
 * log aggregation system rather than dumping verbose development
 * logs to stdout.
 */
if (process.env.NODE_ENV !== "production") {
	app.use(morgan("dev"));
} else {
	app.use(
		morgan("combined", {
			skip: (req) => req.path === "/health"
		})
	);
}

/**
 * Health check
 *
 * Useful for Nginx, PM2, uptime monitoring and load balancers.
 */
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "ok",
		uptime: process.uptime(),
		timestamp: new Date().toISOString()
	});
});

/**
 * API root
 */
app.get("/", (req, res) => {
	res.status(200).json({
		message: "WifiSpace API",
		status: "ok"
	});
});

/**
 * API routes
 */
app.use("/api", router);

/**
 * 404 handler
 *
 * Unknown routes are expected on a public API because scanners,
 * bots and clients can request arbitrary paths.
 */
app.use((req, res, next) => {
	next(
		new NotFoundError(
			`Route ${req.method} ${req.originalUrl} not found`
		)
	);
});

/**
 * Centralized error handler
 */
app.use(errorMiddleware);

export default app;
