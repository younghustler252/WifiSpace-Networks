import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:4000/api",
    withCredentials: false,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;  // Return the config
}, (error) => {
    return Promise.reject(error);  // Handle error in case of failure
});

export default API;
