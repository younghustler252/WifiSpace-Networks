// EditUser.jsx
import { useParams, useNavigate } from "react-router-dom";
import UserForm from "../../components/admin/UserForm";
import { useUserById, useUpdateUser } from "../../hooks/useAdmin";
import { FullScreenSpinner } from "../../components/ui/Loader";

const EditUser = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	// Fetch the user
	const { data, isLoading, isError } = useUserById(id);
	const { mutate: updateUser } = useUpdateUser();

	if (isLoading) return <FullScreenSpinner message="Loading user details..." />;
	if (isError) return <p className="text-red-500 text-center">Failed to load user details.</p>;

	const user = data.user;

	// Handle form submission
	const handleSubmit = (formData, options) => {
		updateUser(
			{ userId: id, updateData: formData },
			{
				onSuccess: () => {
					options?.onSuccess?.();
					navigate("/admin/users");
				},
				onError: options?.onError,
			}
		);
	};

	return (
		<UserForm
			initialValues={{
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				password: "", // empty means "leave unchanged"
				phone: user.phone || "",
				wsnId: user.wsnId || "",
				nin: user.nin || "",
				role: user.role || "user",
				address: user.address || "",
			}}
			onSubmit={handleSubmit}
			submitText="Update User"
		/>
	);
};

export default EditUser;
