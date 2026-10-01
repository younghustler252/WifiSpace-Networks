import type { ProfileValues } from "../schemas/users.schemas";
import type { UpdateProfileBody, UserProfile } from "../types/users.types";

type Dirty = Partial<Record<keyof ProfileValues, boolean | undefined>>;

export function toFormValues(profile: UserProfile): ProfileValues {
	const gender = (["male", "female", "other"] as const).find((g) => g === profile.gender?.toLowerCase());

	return {
		firstName: profile.firstName ?? "",
		lastName: profile.lastName ?? "",
		phone: profile.phone ?? "",
		address: profile.address ?? "",
		gender: gender ?? "",
		dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
		nin: "",
	};
}

export function buildProfilePatch(values: ProfileValues, dirty: Dirty): UpdateProfileBody {
	const body: UpdateProfileBody = {};

	if (dirty.firstName) body.firstName = values.firstName.trim();
	if (dirty.lastName) body.lastName = values.lastName.trim();
	if (dirty.phone && values.phone) body.phone = values.phone.trim();
	if (dirty.address && values.address) body.address = values.address.trim();
	if (dirty.gender && values.gender) body.gender = values.gender;
	if (dirty.dateOfBirth && values.dateOfBirth) body.dateOfBirth = values.dateOfBirth;
	if (dirty.nin && values.nin) body.nin = values.nin;

	return body;
}