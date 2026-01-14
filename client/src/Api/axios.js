import axios from "axios";

// Determine the base URL based on environment
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000/api"
    : import.meta.env.VITE_API_URL;

// Create Axios instance
const API = axios.create({
  baseURL,
  withCredentials: false, // adjust if you need cookies
});

// Add token to request headers if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return the config
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

export default API;
