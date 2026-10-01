// infrastructure/security/credential-cipher.service.js
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

export class CredentialCipherService {
	constructor() {
		this.key = Buffer.from(process.env.CREDENTIAL_ENCRYPTION_KEY, "hex");
		if (this.key.length !== 32) {
			throw new Error("CREDENTIAL_ENCRYPTION_KEY must be a 32-byte (64 hex-char) key");
		}
	}

	encrypt(plainText) {
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
		const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
		const authTag = cipher.getAuthTag();
		return [iv, authTag, encrypted].map((b) => b.toString("base64")).join(":");
	}

	decrypt(payload) {
		const [ivB64, authTagB64, dataB64] = payload.split(":");
		const decipher = crypto.createDecipheriv(ALGORITHM, this.key, Buffer.from(ivB64, "base64"));
		decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
		return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
	}
}