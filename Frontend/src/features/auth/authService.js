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
  await api.post("users/logout");
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
};

// Update user details
const updateUser = async (userData) => {
  const response = await api.put("users", userData);
  return response.data.data;
};

// Get current user profile
const getProfile = async () => {
  const response = await api.get("users/profile");
  return response.data.data;
};

// Get user cart
const getCart = async () => {
  const response = await api.get("users/cart");
  return response.data.data;
};

// Add product to cart
const addToCart = async (productId, count = 1) => {
  const response = await api.put("users/cart", { productId, count });
  return response.data.data;
};

// Remove product from cart
const removeFromCart = async (productId) => {
  const response = await api.put(`users/cart/${productId}`);
  return response.data.data;
};

// Empty user cart
const emptyCart = async () => {
  const response = await api.put("users/cart/empty");
  return response.data.data;
};

// Update cart item quantity
const updateCartItem = async (productId, count) => {
  const response = await api.put("users/cart/update", { productId, count });
  return response.data.data;
};

// Change password
const changePassword = async (oldPassword, newPassword) => {
  const response = await api.put("users/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};

// Upload user avatar
const uploadAvatar = async (avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const response = await api.post("users/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const authService = {
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
  updateUser,
  getProfile,
  getCart,
  addToCart,
  removeFromCart,
  emptyCart,
  updateCartItem,
  changePassword,
  uploadAvatar,
};
