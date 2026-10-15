import mongoose from "mongoose";
import "../config/env.js";
import { spawn } from "node:child_process";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

const BACKUP_DIR = path.resolve("backups/mongodb");

const timestamp = new Date()
	.toISOString()
	.replace(/:/g, "-")
	.replace(/\./g, "-");

const BACKUP_FILE = path.join(
	BACKUP_DIR,
	`mongodb-${timestamp}.archive.gz`
);

function runMongodump({ uri, output }) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			"mongodump",
			[
				`--uri=${uri}`,
				`--archive=${output}`,
				"--gzip",
			],
			{
				stdio: ["ignore", "inherit", "inherit"],
				shell: false,
			}
		);

		child.once("error", (error) => {
			reject(
				new Error(
					`Failed to start mongodump. Ensure MongoDB Database Tools are installed. ${error.message}`
				)
			);
		});

		child.once("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(
					new Error(`mongodump exited with code ${code}`)
				);
			}
		});
	});
}

try {
	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI is not configured");
	}

	await mkdir(BACKUP_DIR, {
		recursive: true,
		mode: 0o700,
	});

	await access(BACKUP_DIR, constants.W_OK);

	console.log("=== MongoDB Backup ===");
	console.log({
		destination: BACKUP_FILE,
		status: "starting",
	});

	// Verify the configured database is reachable before starting.
	await mongoose.connect(process.env.MONGO_URI);

	const database = mongoose.connection.db.databaseName;

	console.log({
		database,
		status: "connected",
	});

	await mongoose.disconnect();

	await runMongodump({
		uri: process.env.MONGO_URI,
		output: BACKUP_FILE,
	});

	console.log("\n=== Backup Completed ===");
	console.log({
		database,
		file: BACKUP_FILE,
		status: "success",
	});
} catch (error) {
	console.error("\n=== Backup Failed ===");
	console.error({
		message: error.message,
	});

	process.exitCode = 1;
} finally {
	await mongoose.disconnect().catch(() => {});
}