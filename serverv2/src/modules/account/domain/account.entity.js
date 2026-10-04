import { ACCOUNT_TYPES, ACCOUNT_TYPE_LIST, APPROVAL_STATUSES, APPROVAL_STATUS_LIST, ACCOUNT_STATUSES, ACCOUNT_STATUS_LIST } from "./account.enum.js";
import { ValidationError } from "../../../shared/errors/domain.errors.js";

export class Account {
	constructor({
		id,
		userId,
		user = null,
		serviceType,
		accountType = ACCOUNT_TYPES.PERSONAL,
		businessName = null,
		companyRegistrationNumber = null,
		taxId = null,
		wsnId = null,
		status = ACCOUNT_STATUSES.ACTIVE,
		approvalStatus = APPROVAL_STATUSES.APPROVED,
		approvalNote = null,
		approvedAt = null,
		approvedBy = null,
		deletedAt = null,
		devices = [],
		createdAt = null,
		updatedAt = null
	}) {
		if (!userId) throw new ValidationError("User ID is required");
		if (!ACCOUNT_TYPE_LIST.includes(accountType)) throw new ValidationError("Invalid account type");
		if (!APPROVAL_STATUS_LIST.includes(approvalStatus)) throw new ValidationError("Invalid approval status");
		if (!ACCOUNT_STATUS_LIST.includes(status)) throw new ValidationError("Invalid account status");

		this.id = id;
		this.userId = userId;
		this.user = user;
		this.serviceType = serviceType;
		this.accountType = accountType;
		this.businessName = accountType === ACCOUNT_TYPES.BUSINESS ? businessName : null;
		this.companyRegistrationNumber = accountType === ACCOUNT_TYPES.BUSINESS ? companyRegistrationNumber : null;
		this.taxId = accountType === ACCOUNT_TYPES.BUSINESS ? taxId : null;
		this.wsnId = wsnId;
		this.status = status;
		this.approvalStatus = approvalStatus;
		this.approvalNote = approvalNote;
		this.approvedAt = approvedAt;
		this.approvedBy = approvedBy;
		this.deletedAt = deletedAt;
		this.devices = devices;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	isBusinessAccount() { return this.accountType === ACCOUNT_TYPES.BUSINESS; }
	isPersonalAccount() { return this.accountType === ACCOUNT_TYPES.PERSONAL; }
	isApproved() { return this.approvalStatus === APPROVAL_STATUSES.APPROVED; }
	isPendingApproval() { return this.approvalStatus === APPROVAL_STATUSES.PENDING; }
	isRejected() { return this.approvalStatus === APPROVAL_STATUSES.REJECTED; }
	isActive() { return this.status === ACCOUNT_STATUSES.ACTIVE; }

	approve(approvedBy) {
		this.approvalStatus = APPROVAL_STATUSES.APPROVED;
		this.approvedBy = approvedBy;
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

	isDeleted() { return this.deletedAt !== null; }
	suspend() { this.status = ACCOUNT_STATUSES.SUSPENDED; }
	pause() { this.status = ACCOUNT_STATUSES.PAUSED; }
	terminate() { this.status = ACCOUNT_STATUSES.TERMINATED; }
	activate() { this.status = ACCOUNT_STATUSES.ACTIVE; }

	transferOwnership(newOwnerId) {
		if (!newOwnerId) throw new ValidationError("New owner ID is required");
		this.userId = newOwnerId;
	}

	toJSON() {
		return { ...this };
	}
}
