import api from "../../utils/axiosInstance.js";

const login = async (loginData) => {
    const response = await api.post("users/login", loginData);
    if (response.data.data.token) {
        localStorage.setItem("userToken", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data.data;
};

const sendOtp = async (email) => {
    await api.post("users/send-otp", { email });
};

const verifyOtp = async (data) => {
    const response = await api.post("users/verify-otp", data);
    return response.data.data;
};

const forgotPassword = async (email) => {
    const response = await api.post("users/forgot", { email });
    return response;
};

const resetPassword = async (data) => {
    const response = await api.put("users/reset", data);
    return response.data.data;
};

const logout = async () => {
    await api.post("users/logout")
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
}

export const authService = {
    login,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout
};