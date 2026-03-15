const bcrypt = require('bcrypt');

 export class PasswordService {
	async compare(plain, hash) {
		return bcrypt.compare(plain, hash);
	}
}

