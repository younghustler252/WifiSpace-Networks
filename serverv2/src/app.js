import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./router/index.js";
import { errorMiddleware } from "./infrastructure/middleware/error.middleware.js";
import { NotFoundError } from "./shared/errors/domain.errors.js";

const app = express();

app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf; // needed for payment webhook signature verification
		}
	})
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
	cors({
		origin: process.env.CORS_ORIGIN?.split(",") ?? true,
		credentials: true
	})
);

if (process.env.NODE_ENV !== "production") {
	app.use(morgan("dev"));
}

app.get("/", (req, res) => {
	res.json({ message: "Server running" });
});

app.use("/api", router);

app.use((req, res, next) => {
	next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorMiddleware);

export default app;