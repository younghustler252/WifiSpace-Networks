import bcrypt from "bcrypt";

export class PasswordService {
	constructor(saltRounds = 10) {
		this.saltRounds = saltRounds;
	}
	
	// ✅ hash a plain password
	async hash(Password) {
	  	return bcrypt.hash(Password, this.saltRounds);
	}

	// ✅ compare plain password to hashed password
	async compare(plainPassword, hashedPassword) {
	  	return bcrypt.compare(plainPassword, hashedPassword);
	}

}