export class CreateRouter {
	constructor(routerRepository, auditService) {
		if (!routerRepository) throw new Error("routerRepository is required");
		this.routerRepository = routerRepository;
		this.auditService = auditService;
	}

	async execute({ name, host, port, username, password, routerType, context }) {
		// Check if router already exists
		const exists = await this.routerRepository.findByHost(host);
		if (exists) {
			throw new Error(`Router with host ${host} already exists`);
		}

		// Generate a code for the router
		const code = `RT-${Math.floor(Math.random() * 1000000)}`;
		console.log("Generated router code:", code);

		// Create router
		const router = await this.routerRepository.create({
			name,
			host,
			port: port || 8728,
			username,
			password,
			routerType,
			code
		});

		// Audit logging (optional)
		if (this.auditService && context) {
			await this.auditService.log({
				actorId: context.actorId || "SYSTEM_ADMIN",
				action: "CREATE_ROUTER",
				targetId: router._id,
				resource: "Router",
				metadata: {
					host: router.host,
					name: router.name,
					routerType: router.routerType
				},
				ip: context.ip,
				userAgent: context.userAgent
			});
		}

		return router;
	}
}