import { useState, useEffect, createContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	login as loginService,
	logout as logoutService,
	getProfile,
} from "../services/authService";
import { ROUTE } from "../Routes/Route";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [bootstrapping, setBootstrapping] = useState(true);

	const navigate = useNavigate();

	// 🔹 App bootstrap (token → profile)
	useEffect(() => {
		let isMounted = true;

		const initAuth = async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				setBootstrapping(false);
				return;
			}

			try {
				const profile = await getProfile();
				if (isMounted) setUser(profile);
			} catch {
				logoutService();
				if (isMounted) setUser(null);
			} finally {
				if (isMounted) setBootstrapping(false);
			}
		};

		initAuth();
		return () => (isMounted = false);
	}, []);

	// 🔹 LOGIN (NO GLOBAL LOADING)
	const login = useCallback(
		async (credentials) => {
			const data = await loginService(credentials);
			setUser(data.user);

			if (data.user.role === "admin") navigate(ROUTE.adminDashboard);
			else navigate(ROUTE.dashboard);

			return data.user;
		},
		[navigate]
	);

	const logout = useCallback(() => {
		logoutService();
		setUser(null);
		navigate(ROUTE.login);
	}, [navigate]);

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				bootstrapping,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
