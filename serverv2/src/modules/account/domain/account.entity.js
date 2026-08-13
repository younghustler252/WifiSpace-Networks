import {
	ACCOUNT_TYPES,
	ACCOUNT_TYPE_LIST,
	APPROVAL_STATUSES,
	APPROVAL_STATUS_LIST,
	SERVICE_TYPES,
	SERVICE_TYPE_LIST
} from "./account.enum.js";

export class Account {
	constructor({
		id,
		userId,
		user = null,

		accountType = ACCOUNT_TYPES.PERSONAL,

		businessName = null,
		companyRegistrationNumber = null,
		taxId = null,

		wsnId,
		routerPassword = null,

		routerId = null,
		routerProfile = "default",

		devices = [],

		serviceType = SERVICE_TYPES.PPPOE,

		approvalStatus = APPROVAL_STATUSES.APPROVED,
		approvalNote = null,
		approvedAt = null,
		approvedBy = null,
    approver = null,

		limitUptime = "0",

		createdAt = null,
		updatedAt = null
	}) {
		if (!userId) {
			throw new Error("User ID is required");
		}

		if (!ACCOUNT_TYPE_LIST.includes(accountType)) {
			throw new Error("Invalid account type");
		}

		if (!SERVICE_TYPE_LIST.includes(serviceType)) {
			throw new Error("Invalid service type");
		}

		if (!APPROVAL_STATUS_LIST.includes(approvalStatus)) {
			throw new Error("Invalid approval status");
		}

		this.id = id;
		this.userId = userId;
		this.user = user;

		this.accountType = accountType;

		this.businessName =
			accountType === ACCOUNT_TYPES.BUSINESS ? businessName : null;

		this.companyRegistrationNumber =
			accountType === ACCOUNT_TYPES.BUSINESS
				? companyRegistrationNumber
				: null;

		this.taxId =
			accountType === ACCOUNT_TYPES.BUSINESS
				? taxId
				: null;

		this.wsnId = wsnId;
		this.routerPassword = routerPassword;

		this.routerId = routerId;
		this.routerProfile = routerProfile;

		this.devices = devices;

		this.serviceType = serviceType;

		this.approvalStatus = approvalStatus;
		this.approvalNote = approvalNote;
		this.approvedAt = approvedAt;
		this.approvedBy = approvedBy;
		this.approver = approver;
		this.limitUptime = limitUptime;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	isBusinessAccount() {
		return this.accountType === ACCOUNT_TYPES.BUSINESS;
	}

	isPersonalAccount() {
		return this.accountType === ACCOUNT_TYPES.PERSONAL;
	}

	isApproved() {
		return this.approvalStatus === APPROVAL_STATUSES.APPROVED;
	}

	isPendingApproval() {
		return this.approvalStatus === APPROVAL_STATUSES.PENDING;
	}

	isRejected() {
		return this.approvalStatus === APPROVAL_STATUSES.REJECTED;
	}

	approve(approvedBy) {
		this.approvalStatus = APPROVAL_STATUSES.APPROVED;
		this.approvedBy = approvedBy;
		this.approver = approvedBy;
		this.approvedAt = new Date();
		this.approvalNote = null;
	}

	reject(note = null) {
		this.approvalStatus = APPROVAL_STATUSES.REJECTED;
		this.approvalNote = note;
		this.approvedAt = null;
		this.approvedBy = null;
	}

	markPending(note = null) {
		this.approvalStatus = APPROVAL_STATUSES.PENDING;
		this.approvalNote = note;
		this.approvedAt = null;
		this.approvedBy = null;
	}

	updateRouterPassword(password) {
		if (!password) {
			throw new Error("Password cannot be empty");
		}

		this.routerPassword = password;
	}

	updateRouterProfile(profile) {
		if (!profile) {
			throw new Error("Router profile cannot be empty");
		}

		this.routerProfile = profile;
	}

	moveToRouter(routerId) {
		if (!routerId) {
			throw new Error("Router ID is required");
		}

		this.routerId = routerId;
	}

	addDevice({ macAddress, hostname = null }) {
		if (!macAddress) {
			throw new Error("MAC address required");
		}

		this.devices.push({
			macAddress: macAddress.toUpperCase(),
			hostname,
			lastSeenAt: new Date()
		});
	}

	updateDeviceLastSeen(macAddress, date = new Date()) {
		const device = this.devices.find(
			device => device.macAddress === macAddress.toUpperCase()
		);

		if (device) {
			device.lastSeenAt = date;
		}
	}

	removeDevice(macAddress) {
		this.devices = this.devices.filter(
			device => device.macAddress !== macAddress.toUpperCase()
		);
	}

    transferOwnership(newOwnerId) {
        if (!newOwnerId) {
            throw new Error("New owner ID is required");
        }

        this.userId = newOwnerId;
    }

	toJSON() {
		const obj = { ...this };
		delete obj.routerPassword;
		return obj;
	}
}