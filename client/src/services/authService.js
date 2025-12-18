import API from "../Api/axios";
import { handleError } from "../utils/handleError";

export const login = async (credentials) => {
    try {
        const { data } = await API.post("/auth/login", credentials);
        if (data.token) localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const registerUser = async (userData) => {
    try {
        const { data } = await API.post("/auth/register", userData);
        if (data.token) localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getProfile = async () => {
    try {
        const { data } = await API.get("/auth/profile");
        return data;
    } catch (error) {
        throw handleError(error);
    }
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const googleAuth = async (credential) => {
    if (!credential) {
        throw new Error("Missing Google credential token.");
    }

    try {
        const { data } = await API.post("/auth/google", { credential });
        
        if (data.token) {
            // Store the token in localStorage or sessionStorage
            localStorage.setItem("token", data.token);
        }

        return data;  // returns the user data and token
    } catch (error) {
        throw handleError(error);  // handle any errors that occur
    }
};

