export class RouterCommands {
	static getIdentity() {
		return {
			command: "/system/identity/print",
			params: []
		};
	}

	static getResources() {
		return {
			command: "/system/resource/print",
			params: []
		};
	}

	static getClock() {
		return {
			command: "/system/clock/print",
			params: []
		};
	}

	static getInterfaces() {
		return {
			command: "/interface/print",
			params: []
		};
	}

	static getAddresses() {
		return {
			command: "/ip/address/print",
			params: []
		};
	}

	static getRoutes() {
		return {
			command: "/ip/route/print",
			params: []
		};
	}

	static getDns() {
		return {
			command: "/ip/dns/print",
			params: []
		};
	}

	static getPackages() {
		return {
			command: "/system/package/print",
			params: []
		};
	}

	static getUsers() {
		return {
			command: "/user/print",
			params: []
		};
	}

	static getLogs() {
        return {
            command: "/log/print",
            params: []
        };
    }

	static reboot() {
		return {
			command: "/system/reboot",
			params: []
		};
	}

	static shutdown() {
		return {
			command: "/system/shutdown",
			params: []
		};
	}

    static execute(command, params = []) {
        return {
            command,
            params
        };
    }
}