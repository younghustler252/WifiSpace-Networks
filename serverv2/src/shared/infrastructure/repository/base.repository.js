export class BaseRepository {
	constructor(model, mapper) {
		this.model = model;
		this.mapper = mapper;
	}

	// -----------------------------
	// POPULATION HANDLER
	// -----------------------------
	applyPopulates(query, populates = []) {
		if (!populates || populates.length === 0) return query;

		populates.forEach((p) => {
			query = query.populate(p);
		});

		return query;
	}

	// -----------------------------
	// PAGINATION PARAM NORMALIZER
	// -----------------------------
	normalizePaginationParams(params = {}) {
		const page = Math.max(parseInt(params.page || 1), 1);
		const limit = Math.max(parseInt(params.limit || 20), 1);
		const skip = (page - 1) * limit;

		return {
			page,
			limit,
			skip
		};
	}

	// -----------------------------
	// PAGINATION
	// -----------------------------
	async paginate({
		filter = {},
		page = 1,
		limit = 20,
		sort = { createdAt: -1 },
		populates = [],
		select = null,
		lean = true
	} = {}) {
		const { page: safePage, limit: safeLimit, skip } =
			this.normalizePaginationParams({ page, limit });

		let query = this.model.find(filter);

		if (select) {
			query = query.select(select);
		}

		if (lean) {
			query = query.lean();
		}

		query = this.applyPopulates(query, populates);

		const [docs, total] = await Promise.all([
			query.sort(sort).skip(skip).limit(safeLimit),
			this.model.countDocuments(filter)
		]);

		return {
			data: this.mapArray(docs),
			meta: {
				total,
				page: safePage,
				limit: safeLimit,
				totalPages: Math.ceil(total / safeLimit)
			}
		};
	}

	// -----------------------------
	// FIND BY ID
	// -----------------------------
	async findById(
		id,
		{ populates = [], select = null, lean = true } = {}
	) {
		if (!id) return null;

		let query = this.model.findById(id);

		if (select) {
			query = query.select(select);
		}

		if (lean) {
			query = query.lean();
		}

		query = this.applyPopulates(query, populates);

		const doc = await query;

		return this.mapOne(doc);
	}

	// -----------------------------
	// FIND ONE
	// -----------------------------
	async findOne({
		filter = {},
		populates = [],
		sort = null,
		select = null,
		lean = true
	} = {}) {
		let query = this.model.findOne(filter);

		if (select) {
			query = query.select(select);
		}

		if (sort) {
			query = query.sort(sort);
		}

		if (lean) {
			query = query.lean();
		}

		query = this.applyPopulates(query, populates);

		const doc = await query;

		return this.mapOne(doc);
	}

	// -----------------------------
	// COUNT
	// -----------------------------
	async count(filter = {}) {
		return this.model.countDocuments(filter);
	}

	// -----------------------------
	// MAPPER HELPERS
	// -----------------------------
	mapOne(doc) {
		if (!doc) return null;
		return this.mapper?.toDomain?.(doc) ?? doc;
	}

	mapArray(docs) {
		if (!Array.isArray(docs)) return [];
		return docs.map((doc) => this.mapOne(doc));
	}
}