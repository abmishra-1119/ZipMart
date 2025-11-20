import api from "../../utils/axiosInstance.js";

// create User for admin
const createUser = async (userData) => {
  const response = await api.post(`users`, userData);
  return response.data.data;
};

// get all users with pagination
const getAllUsers = async ({ limit = 10, page = 1 }) => {
  const response = await api.get(`users?page=${page}&limit=${limit}`);
  return response.data.data;
};

// get all sellers with pagination
const getAllSellers = async ({ limit = 10, page = 1 }) => {
  const response = await api.get(`users/seller?page=${page}&limit=${limit}`);
  return response.data.data;
};

// get user by ID
const getUserById = async (userId) => {
  const response = await api.get(`users/${userId}`);
  return response.data.data;
};

// Delete User by ID
const deleteUserById = async (userId) => {
  const response = await api.delete(`users/${userId}`);
  return response.data.data;
};

const updateProduct = async (productId, productData) => {
  const response = await api.put(`products/${productId}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`products/${productId}`);
  return response.data;
};

const getAllOrders = async ({ limit = 10, page = 1 }) => {
  const response = await api.get(`orders?page=${page}&limit=${limit}`);
  return response.data;
};

const updateRefund = async (orderId, status, refundProcess, refundMsg) => {
  const response = await api.put(`orders/refund/${orderId}`, {
    status,
    refundProcess,
    refundMsg,
  });
  return response.data;
};

const deleteOrder = async (orderId) => {
  const response = await api.delete(`orders/${orderId}`);
  return response.data;
};

const getTopSellingProducts = async ({ page = 1, limit = 10, range }) => {
  const query = new URLSearchParams({
    page,
    limit,
    ...(range && { range }),
  }).toString();

  const response = await api.get(`analytics/topselling?${query}`);
  return response.data.data;
};

const getTotalRevenue = async ({ range }) => {
  const query = new URLSearchParams({
    ...(range && { range }),
  }).toString();

  const response = await api.get(`analytics/totalrevenue?${query}`);
  return response.data.data;
};

const getTopCustomers = async ({ limit = 5, range }) => {
  const query = new URLSearchParams({
    limit,
    ...(range && { range }),
  }).toString();

  const response = await api.get(`analytics/topcustomers?${query}`);
  return response.data.data;
};

const getAdminTopSellingProducts = async ({ limit = 5, range }) => {
  const query = new URLSearchParams({
    limit,
    ...(range && { range }),
  }).toString();

  const response = await api.get(`analytics/topsellers?${query}`);
  return response.data.data;
};

const getOrderStatusSummary = async () => {
  const response = await api.get(`analytics/orderstatus`);
  return response.data.data;
};

const adminGetOrdersByUserId = async (userId) => {
  const response = await api.get(`orders/user/${userId}`);
  console.log(response);

  return response.data;
};

const adminGetOrdersBId = async (userId) => {
  const response = await api.get(`orders/${userId}`);
  return response.data;
};

// Get products for a specific seller
const getSellerProducts = async (sellerId, { limit = 10, page = 1 }) => {
  const response = await api.get(
    `products/seller/${sellerId}?page=${page}&limit=${limit}`
  );
  // console.log(response);

  return response.data.data;
};

// get Order by Selller ID
const adminGetSellerOrders = async ({ sellerId, limit = 10, page = 1 }) => {
  const response = await api.get(
    `orders/seller/${sellerId}?page=${page}&limit=${limit}`
  );
  // console.log(response);
  return response.data;
};

// Toggle User Status (Admin)
const adminToggleUserStatus = async (id) => {
  const res = await api.put(`users/toggle-admin/${id}`);
  return res.data;
};

// Create a

// ------------------------------
export const adminProductService = {
  createUser,
  getAllUsers,
  getAllSellers,
  getUserById,
  deleteUserById,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateRefund,
  deleteOrder,

  getTopSellingProducts,
  getTotalRevenue,
  getTopCustomers,
  getAdminTopSellingProducts,
  getOrderStatusSummary,
  adminGetOrdersByUserId,
  adminGetOrdersBId,
  getSellerProducts,
  adminGetSellerOrders,
  adminToggleUserStatus,
};
