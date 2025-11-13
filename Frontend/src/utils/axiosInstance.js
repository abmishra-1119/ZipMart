import axios from "axios";
import { base_url } from "./baseUrl";

const api = axios.create({
    baseURL: base_url,
    withCredentials: true, // allow cookies to be sent with requests
});

// ✅ REQUEST INTERCEPTOR — attach token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR — handle expired access tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Guard against missing response (e.g., network error)
        if (!error.response) {
            return Promise.reject(error);
        }

        // Handle only 401 errors once per request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 🔄 Call refresh endpoint (must send cookie)
                const res = await axios.post(
                    `${base_url}users/refresh-token`, {}, { withCredentials: true }
                );

                const newToken = res.data.data.token;
                if (newToken) {
                    localStorage.setItem("userToken", newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token expired — forcing logout...");
                localStorage.removeItem("userToken");
                localStorage.removeItem("user");

                // Optionally: redirect or dispatch Redux logout
                // window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;