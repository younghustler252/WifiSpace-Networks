"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

import { authApi } from "@/lib/api/auth";
import { accountApi } from "@/lib/api/account";

import { User, Account } from "@/lib/api/types";

interface AuthContextType {
    user: User | null;
    accounts: Account[];
    activeAccount: Account | null;

    accessToken: string | null;
    refreshToken: string | null;

    loading: boolean;
    isAuthenticated: boolean;

    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) => Promise<void>;

    verifyOtp: (data: { email: string; otp: string }) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;

    login: (data: { email: string; password: string }) => Promise<{ user: User }>;

    logout: () => void;
    switchAccount: (accountId: string) => void;
    fetchAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [activeAccount, setActiveAccount] = useState<Account | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Load auth state from localStorage
   	useEffect(() => {
		if (typeof window === "undefined") return;

		const initAuth = async () => {
			const storedAccess = localStorage.getItem("accessToken");
			const storedRefresh = localStorage.getItem("refreshToken");
			const storedUser = localStorage.getItem("user");

			if (storedAccess && storedUser) {
				setAccessToken(storedAccess);
				setRefreshToken(storedRefresh);
				setUser(JSON.parse(storedUser));

				try {
					await fetchAccounts(); // <-- wait for accounts to load
				} catch (err) {
					console.error("Failed to fetch accounts:", err);
				}
			}

			setLoading(false); // <-- now loading only becomes false AFTER accounts fetch
		};

		initAuth();
	}, []);
    const login = async (data: { email: string; password: string }) => {
        const res = await authApi.login(data);
        const { accessToken, refreshToken, user } = res.data;

        setUser(user);

        if (user.isVerified && accessToken && refreshToken) {
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (user.isVerified) {
            await fetchAccounts();
        }

        return { user };
    };

    const register = async (data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) => {
        await authApi.register(data);
        setPendingEmail(data.email);
    };

    const verifyOtp = async (data: { email: string; otp: string }) => {
        const res = await authApi.verifyOtp(data);
        const { accessToken, refreshToken, user } = res.data;

        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setPendingEmail(null);

        await fetchAccounts();
        return res;
    };

    const resendOtp = async (email: string) => {
        await authApi.resendOtp({ email });
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);

            const res = await accountApi.getMyAccounts();
            const accountsData: Account[] = res.data.data || [];

			
            setAccounts(accountsData);
            // console.log("Fetched accounts:", accountsData);

            if (accountsData.length > 0) {
                const storedId = localStorage.getItem("activeAccountId");
                const selected =
                    accountsData.find((acc) => acc.id === storedId) || accountsData[0];
                setActiveAccount(selected);
            } else {
                setActiveAccount(null);
            }
        } catch (err) {
            console.error("Failed to fetch accounts", err);
            setAccounts([]);
            setActiveAccount(null);
        } finally {
            setLoading(false);
        }
    };

    const switchAccount = (accountId: string) => {
        const selected = accounts.find((acc) => acc.id === accountId);

        if (selected) {
            setActiveAccount(selected);
            localStorage.setItem("activeAccountId", accountId);
        }
    };

    const logout = () => {
        setUser(null);
        setAccounts([]);
        setActiveAccount(null);
        setAccessToken(null);
        setRefreshToken(null);
        setPendingEmail(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("activeAccountId");
    };

    const isAuthenticated = !!accessToken;

    const value: AuthContextType = {
        user,
        accounts,
        activeAccount,
        accessToken,
        refreshToken,
        loading,
        isAuthenticated,
        register,
        verifyOtp,
        resendOtp,
        login,
        logout,
        switchAccount,
        fetchAccounts,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};