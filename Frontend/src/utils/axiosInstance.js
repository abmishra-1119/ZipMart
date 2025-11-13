import axios from "axios";
import { base_url } from "./baseUrl";

const api = axios.create({
    baseURL: base_url,
    withCredentials: true,
});

// REQUEST INTERCEPTOR
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

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            return Promise.reject(error);
        }

        const isTokenExpired = error.response.status === 401 &&
            error.response.data?.code === 'TOKEN_EXPIRED';

        const isUnauthorized = error.response.status === 401;

        if ((isTokenExpired || isUnauthorized) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    `${base_url}users/refresh`,
                    {},
                    { withCredentials: true }
                );
                console.log(res);

                const newToken = res?.data?.data?.accessToken;
                if (newToken) {
                    localStorage.setItem("userToken", newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed — logging out...");
                localStorage.removeItem("userToken");
                localStorage.removeItem("user");

                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }

                return Promise.reject(refreshError);
            }
        }

        // For 403 errors that aren't token-related, reject normally
        return Promise.reject(error);
    }
);

export default api;