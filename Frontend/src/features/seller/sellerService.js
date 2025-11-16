import api from "../../utils/axiosInstance.js";

// Get seller's products
const getMyProducts = async ({ limit = 10, page = 1 }) => {
    const response = await api.get(`products/my?page=${page}&limit=${limit}`);
    return response.data.data;
};

// Delete seller's product
const deleteMyProduct = async (productId) => {
    const response = await api.delete(`products/my/${productId}`);
    return response.data.data;
};

// Update seller's product
const updateMyProduct = async (productId, productData) => {
    const response = await api.put(`products/my/${productId}`, productData);
    return response.data.data;
};

// Create product with multiple images
const createProduct = async (productData) => {
    const response = await api.post('products', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

// get all Orders for seller
const getMyOrders = async ({ limit = 10, page = 1 }) => {
    const response = await api.get(`orders/seller?page=${page}&limit=${limit}`);
    return response.data;
};

// update order status
const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`orders/status/${orderId}`, { status });
    return response.data;
};

// Top selling products for seller (with pagination + range)
const getTopSellingProducts = async ({ page = 1, limit = 10, range = "" }) => {
    const response = await api.get(
        `analytics/seller/topselling?page=${page}&limit=${limit}&range=${range}`
    );

    return response.data.data;
};

// Total Revenue for seller (with range filter)
const getTotalRevenue = async ({ range = "" }) => {
    const response = await api.get(
        `analytics/seller/totalrevenue?range=${range}`
    );

    return response.data.data;
};


export const sellerProductService = {
    getMyProducts,
    deleteMyProduct,
    updateMyProduct,
    createProduct,
    getMyOrders,
    updateOrderStatus,
    getTopSellingProducts,
    getTotalRevenue
};