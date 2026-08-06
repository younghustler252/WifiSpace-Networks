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

	
	normalizePaginationParams(params = {}) {
		const MAX_LIMIT = 100;

		const parsedPage = parseInt(params.page, 10);
		const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

		const parsedLimit = parseInt(params.limit, 10);
		const limit =
			Number.isNaN(parsedLimit) || parsedLimit < 1
				? 20
				: Math.min(parsedLimit, MAX_LIMIT);

		const skip = (page - 1) * limit;

		return { page, limit, skip };
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
		
		if (!id || !this.isValidId(id)) return null;

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

	// NEW: shared ObjectId validation, used by findById above and available
	// to subclasses for the same guard on any other id-based lookup.
	isValidId(id) {
		return /^[0-9a-fA-F]{24}$/.test(String(id));
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

	
	async create(entityOrData) {
		const persistenceData = this.mapper?.toPersistence?.(entityOrData) ?? entityOrData;
		const doc = await this.model.create(persistenceData);
		return this.mapOne(doc);
	}

	
	async update(id, entityOrData, { populates = [] } = {}) {
		if (!id || !this.isValidId(id)) return null;

		const persistenceData = this.mapper?.toPersistence?.(entityOrData) ?? entityOrData;

		let query = this.model.findByIdAndUpdate(id, persistenceData, { new: true });
		query = this.applyPopulates(query, populates);

		const doc = await query;
		return this.mapOne(doc);
	}

	// -----------------------------
	// DELETE (NEW)
	// -----------------------------
	async delete(id) {
		if (!id || !this.isValidId(id)) return null;

		const doc = await this.model.findByIdAndDelete(id);
		return this.mapOne(doc);
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