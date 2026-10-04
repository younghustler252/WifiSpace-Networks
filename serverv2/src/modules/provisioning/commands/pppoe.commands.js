export class PppoeCommands {
	static createUser({
		username,
		password,
		profile = "default"
	}) {
		return {
			command: "/ppp/secret/add",
			params: [
				`=name=${username}`,
				`=password=${password}`,
				"=service=pppoe",
				`=profile=${profile}`
			]
		};
	}

	static findUser(username) {
		return {
			command: "/ppp/secret/print",
			params: [`?name=${username}`]
		};
	}

	static updateUser({
		id,
		profile = "default"
	}) {
		return {
			command: "/ppp/secret/set",
			params: [
				`=.id=${id}`,
				`=profile=${profile}`
			]
		};
	}

	static changePassword({
		id,
		password
	}) {
		return {
			command: "/ppp/secret/set",
			params: [
				`=.id=${id}`,
				`=password=${password}`
			]
		};
	}

	static suspendUser(id) {
		return {
			command: "/ppp/secret/set",
			params: [
				`=.id=${id}`,
				"=disabled=yes"
			]
		};
	}

	static resumeUser(id) {
		return {
			command: "/ppp/secret/set",
			params: [
				`=.id=${id}`,
				"=disabled=no"
			]
		};
	}

	static removeUser(id) {
		return {
			command: "/ppp/secret/remove",
			params: [`=.id=${id}`]
		};
	}

	static getProfiles() {
		return {
			command: "/ppp/profile/print",
			params: []
		};
	}

	static getActiveSessions(username) {
		const params = [];

		if (username) {
			params.push(`?name=${username}`);
		}

		return {
			command: "/ppp/active/print",
			params
		};
	}

	static disconnectSession(id) {
		return {
			command: "/ppp/active/remove",
			params: [`=.id=${id}`]
		};
	}
}