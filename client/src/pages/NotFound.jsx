import { useNavigate } from "react-router-dom";
import { ROUTE } from "../Routes/Route";
import Button from "../components/ui/Button";

const NotFound = () => {
	const navigate = useNavigate();

	const goBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate(ROUTE.dashboard);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-surface px-6">
			<div className="max-w-md w-full text-center space-y-6">
				<h1 className="text-6xl font-bold text-primary">404</h1>

				<p className="text-lg text-primary">
					Page not available
				</p>

				<p className="text-sm text-primary/70">
					The page you’re trying to access doesn’t exist or was moved.
				</p>

				<div className="flex gap-3 justify-center pt-4">
					<Button onClick={goBack} variant="outline">
						Go Back
					</Button>

					<Button onClick={() => navigate(ROUTE.dashboard)}>
						Go to Dashboard
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
