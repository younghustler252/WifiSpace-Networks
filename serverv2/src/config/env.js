import dotenv from "dotenv";

const envFile =
	process.env.NODE_ENV === "production"
		? ".env.production"
		: ".env.development";

dotenv.config({ path: envFile });

// Optional: fail fast if missing critical vars
if (!process.env.MONGO_URI) {
	throw new Error("❌ MONGO_URI is not defined in environment variables");
}