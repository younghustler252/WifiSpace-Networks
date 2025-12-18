// components/ui/BackButton.jsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Back" }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary/10 transition"
        >
            <ArrowLeft size={18} />
            {label}
        </button>
    );
};

export default BackButton;
