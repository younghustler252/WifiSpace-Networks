export class PlanController {

	constructor({
		createPlan,
		updatePlan,
		deletePlan,
		getAllPlans,
		getPlanById
	}) {
		this.createPlan = createPlan;
		this.updatePlan = updatePlan;
		this.deletePlan = deletePlan;
		this.getAllPlans = getAllPlans;
		this.getPlanById = getPlanById;
	}

	create = async (req, res, next) => {
		try {

			const plan = await this.createPlan.execute(req.body);

			res.status(201).json(plan);

		} catch (err) {
			next(err);
		}
	};

	update = async (req, res, next) => {
		try {

			const plan = await this.updatePlan.execute(
				req.params.id,
				req.body
			);

			res.json(plan);

		} catch (err) {
			next(err);
		}
	};

	remove = async (req, res, next) => {
		try {

			const result = await this.deletePlan.execute(req.params.id);

			res.json(result);

		} catch (err) {
			next(err);
		}
	};

	getAll = async (req, res, next) => {
		try {

			const plans = await this.getAllPlans.execute({
				type: req.query.type,
				sort: req.query.sort
			});

			res.json(plans);

		} catch (err) {
			next(err);
		}
	};

	getById = async (req, res, next) => {
		try {

			const plan = await this.getPlanById.execute(req.params.id);

			res.json(plan);

		} catch (err) {
			next(err);
		}
	};
}