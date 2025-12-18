import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../../hooks/useAdmin";  // Assuming we added the createUser hook
import Input from "../../components/ui/Input";  // Your custom input component
import BackButton from "../../components/ui/BackButton";  // Back button component
import { Spinner } from "../../components/ui/Loader";  // Custom loading spinner

const CreateUser = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        wsnId: "",
        nin: "",
        role: "user", // Default role is user
        address: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { mutate: createUser } = useCreateUser();  // Assuming `useCreateUser` is the hook for creating a user

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Specifically for the WSN ID, prefix the value with "WSN-" when updating the state
        if (name === "wsnId") {
            setFormData((prev) => ({
                ...prev,
                [name]: value.startsWith("WSN") ? value : `WSN${value}`, // Adds "WSN-" prefix
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("Form Data:", formData);  // Debugging: check what data is being sent

        try {
            await createUser(formData);
            console.log("User created successfully");  // Debugging: check if createUser is successful
            navigate("/admin/users");  // Redirect after successful creation
        } catch (error) {
            console.error("Error while creating user:", error);  // Debugging: check if there’s an error
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 bg-card shadow-card rounded-lg">
            {/* Back Button */}
            <BackButton label="Back to Users" />

            <h1 className="text-3xl font-bold text-primary mb-6">Create New User</h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="text-danger text-center mb-4">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        icon={<i className="fas fa-user"></i>}
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        icon={<i className="fas fa-user"></i>}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        icon={<i className="fas fa-envelope"></i>}
                    />
                    <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        icon={<i className="fas fa-phone-alt"></i>}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                        label="WSN ID"
                        name="wsnId"
                        value={formData.wsnId}
                        onChange={handleChange}
                        placeholder="Enter WSN ID (e.g., 12345)"
                        icon={<i className="fas fa-id-badge"></i>}
                    />
                    <Input
                        label="NIN"
                        name="nin"
                        value={formData.nin}
                        onChange={handleChange}
                        placeholder="Enter NIN"
                        icon={<i className="fas fa-credit-card"></i>}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="role" className="text-primary mb-1">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border border-surface rounded-md px-3 py-2 bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        icon={<i className="fas fa-map-marker-alt"></i>}
                    />
                </div>

                {/* Password Input */}
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    icon={<i className="fas fa-lock"></i>}
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="btn btn-primary px-8 py-3 rounded-full text-lg w-full sm:w-auto"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : "Create User"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
