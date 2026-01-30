import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FullScreenSpinner } from "../components/ui/Loader";
import { ROUTE } from "./Route";

const ProtectedRoute = ({ children, roles }) => {
	const { isAuthenticated, user, bootstrapping } = useAuth();

	// 🔄 App is still restoring auth (refresh, first load)
	if (bootstrapping) {
		return <FullScreenSpinner />;
	}

	if (!isAuthenticated) {
		return <Navigate to={ROUTE.login} replace />;
	}

	if (roles && !roles.includes(user?.role)) {
		return <Navigate to="/unauthorized" replace />;
	}

	return children;
};

export default ProtectedRoute;
