export const USER_ROLE = {
	CUSTOMER: "customer",
	STAFF: "staff",
	SUPERADMIN: "superadmin"
};
export const USER_ROLE_LIST = Object.values(USER_ROLE);

export const USER_STATUS = {
	ACTIVE: "active",
	SUSPENDED: "suspended",
	BANNED: "banned"
};
export const USER_STATUS_LIST = Object.values(USER_STATUS);

export const GENDER = {
	MALE: "male",
	FEMALE: "female",
	OTHER: "other"
};
export const GENDER_LIST = Object.values(GENDER);

export const THEME = {
	LIGHT: "light",
	DARK: "dark",
	SYSTEM: "system"
};
export const THEME_LIST = Object.values(THEME);


export const USER_ERROR_CODES = {
	USER_NOT_FOUND: "USER_NOT_FOUND",
	EMAIL_ALREADY_IN_USE: "EMAIL_ALREADY_IN_USE",
	INVALID_OLD_PASSWORD: "INVALID_OLD_PASSWORD",
	WEAK_PASSWORD: "WEAK_PASSWORD",
	PASSWORD_SAME_AS_OLD: "PASSWORD_SAME_AS_OLD",
	CANNOT_MODIFY_SUPERADMIN: "CANNOT_MODIFY_SUPERADMIN",
	CANNOT_DELETE_SELF: "CANNOT_DELETE_SELF",
	CANNOT_BAN_SELF: "CANNOT_BAN_SELF",
	IMPERSONATION_NOT_ALLOWED: "IMPERSONATION_NOT_ALLOWED"
};