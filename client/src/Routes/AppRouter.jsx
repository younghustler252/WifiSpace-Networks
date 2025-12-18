import { Routes, Route } from "react-router-dom";
import { ROUTE } from "./Route";
import ProtectedRoute from "./ProtectedRoutes";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Verify from "../pages/auth/Verify";

// Layouts
import AuthLayout from "../layout/AuthLayout";
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";

// User pages
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Subscription from "../pages/Subscription";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminManageUsers from "../pages/admin/AdminManageUser";
import AdminUserDetails from "../pages/admin/AdminUserDetails";
import CreateUser from "../pages/admin/CreateUser";
import AdminEditSubscription from "../pages/admin/AdminEditSubscription";
import AdminCreateSubscription from "../pages/admin/AdminCreateSubscription";
import AdminSubscriptions from "../pages/admin/AdminSubscriptioms";
import PaymentSuccess from "../pages/PaymentSucceess";
import Transaction from "../pages/Transactions";


const AppRouter = () => {
	return (
		<Routes>

			{/* AUTH ROUTES */}
			<Route element={<AuthLayout />}>
				<Route path={ROUTE.login} element={<Login />} />
				<Route path={ROUTE.register} element={<Register />} />
				<Route path={ROUTE.verify} element={<Verify />} />
			</Route>

			{/* USER ROUTES */}
			<Route
				element={
					<ProtectedRoute roles={["user", "admin"]}>
						<MainLayout />
					</ProtectedRoute>
				}
			>
				<Route path={ROUTE.dashboard} element={<Dashboard />} />
				<Route path={ROUTE.subscriptions} element={<Subscription />} />
				<Route path={ROUTE.profile} element={<Profile />} />
				<Route path={ROUTE.transactions} element={<Transaction />} />
				<Route path={ROUTE.paymentSuccess} element={<PaymentSuccess />} />

			</Route>

			{/* ADMIN ROUTES */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute roles={["admin"]}>
						<AdminLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<AdminDashboard />} />
				<Route path="users" element={<AdminManageUsers />} />
				<Route path="users/:id" element={<AdminUserDetails />} />
				<Route path="users/create" element={<CreateUser />} />
				<Route path="subscriptions" element={<AdminSubscriptions />} />
				<Route path="subscriptions/create" element={<AdminCreateSubscription />} />
				<Route path="subscriptions/edit/:id" element={<AdminEditSubscription />} />
			</Route>

		</Routes>
	);
};

export default AppRouter;
