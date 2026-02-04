import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../../hooks/useAdmin";
import UserForm from "../../components/admin/UserForm";

const CreateUser = () => {
    const navigate = useNavigate();
    const { mutate: createUser } = useCreateUser();

    const handleSubmit = (formData, options) => {
        createUser(formData, {
            ...options,
            onSuccess: (data) => {
                options?.onSuccess?.();
                navigate("/admin/users");
            },
        });
    };

    return <UserForm initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        wsnId: "",
        nin: "",
        role: "user",
        address: "",
    }} onSubmit={handleSubmit} submitText="Create User" />;
};

export default CreateUser;
