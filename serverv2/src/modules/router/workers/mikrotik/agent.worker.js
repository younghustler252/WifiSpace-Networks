import { mikrotikClient } from "./mikrotik.client.js";

export class AgentWorker {
	constructor({ agentService, routerRepository }) {
		this.agentService = agentService;
		this.routerRepository = routerRepository;
		this.running = false;
	}

	start() {
		this.running = true;
		this.loop();
	}

	stop() {
		this.running = false;
	}

	async loop() {
		while (this.running) {
			const agents = this.agentService.getAllAgents();

			for (const agent of agents) {
				const jobs = this.agentService.fetchCommands(agent.connectorId);

				for (const job of jobs) {
					try {
						const router = await this.routerRepository.findByConnectorId(
							agent.connectorId
						);

						const result = await mikrotikClient.execute(
							router,
							job.command.command,
							job.command.params
						);

						// 👇 CRITICAL PART
						this.agentService.completeCommand(job.id, result);

					} catch (err) {
						this.agentService.completeCommand(job.id, {
							error: err.message
						});
					}
				}
			}

			await new Promise(r => setTimeout(r, 1000));
		}
	}
}