// account/usecases/admin/reconcile-ipoe-accounts.usecase.js
import { NotFoundError } from "../../../../shared/errors/domain.errors.js";
import { ROUTER_ERROR_CODES } from "../../../router/domain/router.enum.js";
import { SERVICE_TYPES } from "../../domain/account.enum.js";

const MAC_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
const IGNORED_ROUTER_USERS = new Set(["default-trial"]);

function normalizeMac(value) {
	if (!value) return null;
	const mac = String(value).trim().toUpperCase().replace(/-/g, ":");
	return MAC_PATTERN.test(mac) ? mac : null;
}

function normalizeKey(name) {
	const match = /^([A-Za-z]+)0*(\d+)$/.exec(name);
	return match ? `${match[1].toUpperCase()}${Number(match[2])}` : String(name).toUpperCase();
}

export class ReconcileIpoeAccounts {
	constructor({ accountRepository, subscriptionRepository, routerRepository, planRepository, hotspotService, auditService }) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.routerRepository = routerRepository;
		this.planRepository = planRepository;
		this.hotspotService = hotspotService;
		this.auditService = auditService;
	}

	async execute({ routerFilter = null, apply = false, fixWsnIds = false } = {}) {
		const [pppoeAccounts, hotspotAccounts, plans, routers] = await Promise.all([
			this.accountRepository.findAllByServiceType(SERVICE_TYPES.PPPOE),
			this.accountRepository.findAllByServiceType(SERVICE_TYPES.HOTSPOT),
			this._loadPlans(),
			this._loadRouters(routerFilter)
		]);

		if (!routers.length) {
			throw new NotFoundError("No matching enabled router found", ROUTER_ERROR_CODES.ROUTER_NOT_FOUND);
		}

		const index = this._buildIndex(pppoeAccounts);
		const hotspotNames = new Set(hotspotAccounts.filter((account) => account.wsnId).map((account) => account.wsnId.toLowerCase()));

		const rows = [];
		const candidates = [];
		let complete = !routerFilter;

		for (const router of routers) {
			const fetched = await this._fetchRouterUsers(router);

			if (fetched.error) {
				complete = false;
				rows.push({ router: router.code, status: "router_failed", reason: fetched.error });
				continue;
			}

			candidates.push(...this._classifyRouter({ router, ...fetched, index, hotspotNames, plans }));
		}

		this._flagDuplicates(candidates);

		for (const candidate of candidates) {
			rows.push(await this._process(candidate, { apply, fixWsnIds }));
		}

		return {
			summary: this._summarize(rows, apply),
			complete,
			rows,
			notFound: complete ? this._notFound(pppoeAccounts, candidates) : null
		};
	}

	async _loadRouters(routerFilter) {
		const { data } = await this.routerRepository.paginate({ filter: { isEnabled: true }, limit: 100 });
		const selected = routerFilter ? data.filter((router) => router.code === routerFilter || router.id === routerFilter) : data;
		const withCredentials = await Promise.all(selected.map((router) => this.routerRepository.findById(router.id)));

		return withCredentials.filter(Boolean);
	}

	async _loadPlans() {
		const { data } = await this.planRepository.paginate({ filter: { serviceType: SERVICE_TYPES.PPPOE }, limit: 100 });
		const byProfile = new Map();

		for (const plan of data) {
			byProfile.set(plan.mikrotikProfile, [...(byProfile.get(plan.mikrotikProfile) ?? []), plan.name]);
		}

		return byProfile;
	}

	async _fetchRouterUsers(router) {
		if (router.credentialsMissing) return { error: "credentials_missing" };

		try {
			const [users, hosts] = await Promise.all([
				this.hotspotService.getAllUsers(router),
				this.hotspotService.getAllHosts(router)
			]);

			return { users, hosts };
		} catch (error) {
			return { error: error.errno || error.code || error.message || "unreachable" };
		}
	}

	_buildIndex(accounts) {
		const exact = new Map();
		const normalized = new Map();

		for (const account of accounts) {
			if (!account.wsnId) continue;

			exact.set(account.wsnId.toLowerCase(), account);

			const key = normalizeKey(account.wsnId);
			normalized.set(key, [...(normalized.get(key) ?? []), account]);
		}

		return { exact, normalized };
	}

	_classifyRouter({ router, users, hosts, index, hotspotNames, plans }) {
		const hostByUser = new Map();
		for (const host of hosts) {
			if (host.user) hostByUser.set(host.user, host);
		}

		return users
			.filter((user) => user.name && !IGNORED_ROUTER_USERS.has(user.name))
			.map((user) => {
				const base = {
					router,
					wsnId: user.name,
					profile: user.profile ?? null,
					disabled: user.disabled === "true",
					macAddress: normalizeMac(user["mac-address"]) ?? normalizeMac(hostByUser.get(user.name)?.["mac-address"]),
					suggestedPlans: (plans.get(user.profile) ?? []).join(" | ")
				};

				if (hotspotNames.has(user.name.toLowerCase())) return { ...base, matchType: "hotspot_account" };

				const exact = index.exact.get(user.name.toLowerCase());
				if (exact) return { ...base, matchType: "exact", account: exact };

				const normalized = index.normalized.get(normalizeKey(user.name)) ?? [];
				if (normalized.length === 1) return { ...base, matchType: "normalized", account: normalized[0] };
				if (normalized.length > 1) return { ...base, matchType: "ambiguous" };

				return { ...base, matchType: "none" };
			});
	}

	_flagDuplicates(candidates) {
		const byAccount = new Map();
		const byMac = new Map();

		for (const candidate of candidates) {
			if (!candidate.account) continue;

			byAccount.set(candidate.account.id, [...(byAccount.get(candidate.account.id) ?? []), candidate]);

			if (candidate.macAddress) {
				byMac.set(candidate.macAddress, [...(byMac.get(candidate.macAddress) ?? []), candidate]);
			}
		}

		for (const list of byAccount.values()) {
			if (list.length < 2) continue;

			const detail = list.map((item) => `${item.router.code}:${item.wsnId}`).join(", ");
			for (const candidate of list) {
				candidate.skip = candidate.skip ?? { code: "account_found_more_than_once", detail };
			}
		}

		for (const list of byMac.values()) {
			if (new Set(list.map((item) => item.account.id)).size < 2) continue;

			const detail = list.map((item) => item.wsnId).join(", ");
			for (const candidate of list) {
				candidate.skip = candidate.skip ?? { code: "mac_shared_by_router_users", detail };
			}
		}
	}

	async _process(candidate, { apply, fixWsnIds }) {
		const { router, account, matchType } = candidate;

		const row = {
			router: router.code,
			wsnId: candidate.wsnId,
			matchType,
			profile: candidate.profile,
			macAddress: candidate.macAddress,
			suggestedPlans: candidate.suggestedPlans,
			accountId: account?.id ?? null,
			accountWsnId: account?.wsnId ?? null,
			drift: null,
			changes: {}
		};

		if (!account) {
			if (matchType === "hotspot_account") return { ...row, status: "ignored" };
			return { ...row, status: "unmatched", reason: matchType === "ambiguous" ? "several_db_accounts_share_this_number" : null };
		}

		const subscription = await this.subscriptionRepository.findCurrentByAccountId(account.id);
		row.drift = this._drift(candidate, subscription);

		const skip = candidate.skip ?? (await this._skipReason(candidate, { fixWsnIds }));
		if (skip) return { ...row, status: "skipped", reason: skip.code, detail: skip.detail ?? null };

		const changes = this._changes(candidate);
		const needsSubscriptionSync = Boolean(subscription?.isActive() && !candidate.disabled && subscription.mikrotikStatus !== "synced");
		row.changes = changes;

		if (!Object.keys(changes).length && !needsSubscriptionSync) return { ...row, status: "already_linked" };
		if (!apply) return { ...row, status: "would_link", subscriptionWillBeMarkedSynced: needsSubscriptionSync };

		try {
			if (Object.keys(changes).length) {
				await this.accountRepository.update(account.id, changes);

				await this.auditService?.log({
					actorId: null,
					actorType: "system",
					action: "IPOE_ACCOUNT_RECONCILED",
					entity: "Account",
					entityId: account.id,
					oldValue: { routerId: account.routerId, macAddress: account.macAddress, routerProfile: account.routerProfile, wsnId: account.wsnId },
					newValue: changes
				});
			}

			if (needsSubscriptionSync) {
				await this.subscriptionRepository.update(subscription.id, {
					mikrotikStatus: "synced",
					mikrotikError: null,
					mikrotikLastSyncAt: new Date()
				});
			}
		} catch (error) {
			return { ...row, status: "failed", reason: error.message };
		}

		return { ...row, status: "linked", subscriptionMarkedSynced: needsSubscriptionSync };
	}

	async _skipReason(candidate, { fixWsnIds }) {
		const { account, matchType, macAddress, wsnId } = candidate;

		if (account.accessMethod !== "ipoe") return { code: "account_is_ppp" };

		if (matchType === "normalized") {
			if (!fixWsnIds) return { code: "needs_fix_wsn_ids", detail: `database has ${account.wsnId}, router has ${wsnId}` };

			if (await this.accountRepository.wsnIdExists(wsnId, { excludeId: account.id })) {
				return { code: "router_name_already_used_in_database", detail: wsnId };
			}
		}

		if (macAddress) {
			const owner = await this.accountRepository.findOne({ macAddress, serviceType: SERVICE_TYPES.PPPOE });
			if (owner && owner.id !== account.id) return { code: "mac_belongs_to_other_account", detail: owner.wsnId };
		}

		return null;
	}

	_changes({ account, router, matchType, wsnId, macAddress, profile }) {
		const changes = {};

		if (account.routerId !== router.id) changes.routerId = router.id;
		if (macAddress && account.macAddress !== macAddress) changes.macAddress = macAddress;
		if (profile && (!account.routerProfile || account.routerProfile === "default") && profile !== account.routerProfile) {
			changes.routerProfile = profile;
		}
		if (matchType === "normalized") changes.wsnId = wsnId;

		return changes;
	}

	_drift({ disabled, profile }, subscription) {
		const active = Boolean(subscription?.isActive());

		if (disabled && active) return "router_disabled_but_subscription_active";
		if (!disabled && !active) return "router_enabled_but_no_active_subscription";

		const planProfile = subscription?.planSnapshot?.mikrotikProfile;
		if (active && planProfile && profile && planProfile !== profile) return "router_profile_differs_from_plan";

		return "none";
	}

	_summarize(rows, apply) {
		const count = (status) => rows.filter((row) => row.status === status).length;
		const tally = (items, key) => items.reduce((totals, item) => ({ ...totals, [item[key]]: (totals[item[key]] ?? 0) + 1 }), {});

		return {
			mode: apply ? "applied" : "dry-run",
			routerUsersSeen: rows.filter((row) => row.status !== "router_failed").length,
			routersFailed: count("router_failed"),
			linked: count("linked"),
			wouldLink: count("would_link"),
			alreadyLinked: count("already_linked"),
			unmatchedOnRouter: count("unmatched"),
			ignoredHotspotUsers: count("ignored"),
			failed: count("failed"),
			skipped: tally(rows.filter((row) => row.status === "skipped"), "reason"),
			drift: tally(rows.filter((row) => row.drift && row.drift !== "none"), "drift")
		};
	}

	_notFound(pppoeAccounts, candidates) {
		const seen = new Set(candidates.filter((candidate) => candidate.account).map((candidate) => candidate.account.id));

		return pppoeAccounts
			.filter((account) => account.accessMethod === "ipoe" && !seen.has(account.id))
			.map((account) => ({ accountId: account.id, wsnId: account.wsnId, status: account.status, approvalStatus: account.approvalStatus, routerId: account.routerId }));
	}
}