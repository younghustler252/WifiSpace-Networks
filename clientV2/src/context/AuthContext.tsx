"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from "react";

import { authApi } from "@/lib/api/auth";
import { accountApi } from "@/features/account/api/account.api";

import type { User } from "@/lib/api/user";
import type { AuthResponse } from "@/lib/api/auth";
import type { Account } from "@/features/account/api/account.types";

// ======================================
// AUTH CONTEXT TYPE
// ======================================

interface AuthContextType {
	user: User | null;

	accounts: Account[];
	activeAccount: Account | null;

	accessToken: string | null;
	refreshToken: string | null;

	loading: boolean;
	isAuthenticated: boolean;

	pendingEmail: string | null;

	register: (data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) => Promise<{ message: string }>;

	verifyOtp: (data: {
		email: string;
		otp: string;
	}) => Promise<AuthResponse>;

	resendOtp: (
		email: string
	) => Promise<{
		message: string;
		otpExpiresAt: number;
		nextResendAt: number;
		canResend: boolean;
		resendCooldownSeconds: number;
	}>;

	login: (data: {
		email: string;
		password: string;
	}) => Promise<{
		user: User;
		message: string;
	}>;

	logout: () => void;

	switchAccount: (accountId: string) => void;

	fetchAccounts: () => Promise<void>;
}

// ======================================
// CONTEXT
// ======================================

const AuthContext = createContext<AuthContextType | null>(null);

// ======================================
// ERROR HELPER
// ======================================

const getErrorMessage = (err: unknown) => {
	const error = err as {
		response?: {
			data?: {
				message?: string;
			};
		};
		message?: string;
	};

	return (
		error?.response?.data?.message ||
		error?.message ||
		"Something went wrong"
	);
};

// ======================================
// PROVIDER
// ======================================

export const AuthProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [user, setUser] = useState<User | null>(null);

	const [accounts, setAccounts] = useState<Account[]>([]);

	const [activeAccount, setActiveAccount] =
		useState<Account | null>(null);

	const [accessToken, setAccessToken] =
		useState<string | null>(null);

	const [refreshToken, setRefreshToken] =
		useState<string | null>(null);

	const [pendingEmail, setPendingEmail] =
		useState<string | null>(null);

	const [loading, setLoading] = useState(true);

	const isAuthenticated = !!accessToken;

	// ======================================
	// FETCH ACCOUNTS
	// ======================================

	const fetchAccounts = useCallback(async () => {
		try {
			setLoading(true);

			const response = await accountApi.getMyAccounts();

			// New API shape:
			// ApiResponse<Account[]>
			const accountsData = response.data;

			setAccounts(accountsData);

			if (accountsData.length === 0) {
				setActiveAccount(null);
				localStorage.removeItem("activeAccountId");
				return;
			}

			const storedId =
				localStorage.getItem("activeAccountId");

			const selectedAccount =
				accountsData.find(
					(account) => account.id === storedId
				) ?? accountsData[0];

			setActiveAccount(selectedAccount);

			localStorage.setItem(
				"activeAccountId",
				selectedAccount.id
			);
		} catch (err) {
			console.error(
				"Failed to fetch accounts:",
				err
			);

			setAccounts([]);
			setActiveAccount(null);
		} finally {
			setLoading(false);
		}
	}, []);

	// ======================================
	// INIT AUTH
	// ======================================

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const initAuth = async () => {
			try {
				const storedAccess =
					localStorage.getItem("accessToken");

				const storedRefresh =
					localStorage.getItem("refreshToken");

				const storedUser =
					localStorage.getItem("user");

				if (!storedAccess || !storedUser) {
					return;
				}

				const parsedUser: User =
					JSON.parse(storedUser);

				setAccessToken(storedAccess);
				setRefreshToken(storedRefresh);
				setUser(parsedUser);

				await fetchAccounts();
			} catch (err) {
				console.error(
					"Auth initialization failed:",
					err
				);
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, [fetchAccounts]);

	// ======================================
	// LOGIN
	// ======================================

	const login = async (data: {
		email: string;
		password: string;
	}) => {
		try {
			const response = await authApi.login(data);

			const {
				accessToken,
				refreshToken,
				user,
			} = response.data;

			// Unverified account
			if (!user.isVerified) {
				setUser(user);
				setPendingEmail(user.email);

				return {
					user,
					message: "ACCOUNT_NOT_VERIFIED",
				};
			}

			setUser(user);
			setAccessToken(accessToken);
			setRefreshToken(refreshToken);

			localStorage.setItem(
				"accessToken",
				accessToken
			);

			localStorage.setItem(
				"refreshToken",
				refreshToken
			);

			localStorage.setItem(
				"user",
				JSON.stringify(user)
			);

			await fetchAccounts();

			return {
				user,
				message: response.message,
			};
		} catch (err) {
			throw new Error(
				getErrorMessage(err)
			);
		}
	};

	// ======================================
	// REGISTER
	// ======================================

	const register = async (data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) => {
		try {
			const response =
				await authApi.register(data);

			setPendingEmail(data.email);

			return {
				message: response.message,
			};
		} catch (err) {
			throw new Error(
				getErrorMessage(err)
			);
		}
	};

	// ======================================
	// VERIFY OTP
	// ======================================

	const verifyOtp = async (data: {
		email: string;
		otp: string;
	}) => {
		try {
			const response =
				await authApi.verifyOtp(data);

			const {
				accessToken,
				refreshToken,
				user,
			} = response.data;

			setUser(user);
			setAccessToken(accessToken);
			setRefreshToken(refreshToken);

			localStorage.setItem(
				"accessToken",
				accessToken
			);

			localStorage.setItem(
				"refreshToken",
				refreshToken
			);

			localStorage.setItem(
				"user",
				JSON.stringify(user)
			);

			setPendingEmail(null);

			await fetchAccounts();

			return response.data;
		} catch (err) {
			throw new Error(
				getErrorMessage(err)
			);
		}
	};

	// ======================================
	// RESEND OTP
	// ======================================

	const resendOtp = async (email: string) => {
		try {
			const response =
				await authApi.resendOtp({ email });

			return response.data;
		} catch (err) {
			throw new Error(
				getErrorMessage(err)
			);
		}
	};

	// ======================================
	// SWITCH ACCOUNT
	// ======================================

	const switchAccount = (
		accountId: string
	) => {
		const selectedAccount =
			accounts.find(
				(account) =>
					account.id === accountId
			);

		if (!selectedAccount) {
			return;
		}

		setActiveAccount(selectedAccount);

		localStorage.setItem(
			"activeAccountId",
			selectedAccount.id
		);
	};

	// ======================================
	// LOGOUT
	// ======================================

	const logout = () => {
		setUser(null);
		setAccounts([]);
		setActiveAccount(null);

		setAccessToken(null);
		setRefreshToken(null);

		setPendingEmail(null);

		// Do not clear the entire localStorage.
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
		localStorage.removeItem("activeAccountId");
	};

	// ======================================
	// PROVIDER
	// ======================================

	return (
		<AuthContext.Provider
			value={{
				user,
				accounts,
				activeAccount,

				accessToken,
				refreshToken,

				loading,
				isAuthenticated,

				pendingEmail,

				register,
				verifyOtp,
				resendOtp,
				login,
				logout,

				switchAccount,
				fetchAccounts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// ======================================
// HOOK
// ======================================

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error(
			"useAuth must be used within AuthProvider"
		);
	}

	return context;
};
