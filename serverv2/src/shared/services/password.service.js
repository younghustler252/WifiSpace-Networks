import bcrypt from "bcrypt";

export class PasswordService {
	constructor({bcryptSaltRounds}) {
		this.saltRounds = bcryptSaltRounds || 10;
	}
	
	// ✅ hash a plain password
	async hash(Password) {
		console.log("SALT ROUNDS =>", this.saltRounds, typeof this.saltRounds);
	  	return bcrypt.hash(Password, this.saltRounds);
	}

	// ✅ compare plain password to hashed password
	async compare(plainPassword, hashedPassword) {
	  	return bcrypt.compare(plainPassword, hashedPassword);
	}

}