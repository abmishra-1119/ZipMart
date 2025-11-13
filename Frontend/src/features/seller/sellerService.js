import api from "../../utils/axiosInstance.js";

// Get seller's products
const getMyProducts = async ({ limit = 10, page = 1 }) => {
    const response = await api.get(`products/my?page=${page}&limit=${limit}`);
    return response.data;
};

// Delete seller's product
const deleteMyProduct = async (productId) => {
    const response = await api.delete(`products/my/${productId}`);
    return response.data;
};

// Update seller's product
const updateMyProduct = async (productId, productData) => {
    const response = await api.put(`products/my/${productId}`, productData);
    return response.data;
};

// Create product with multiple images
const createProduct = async (productData) => {
    const response = await api.post('products', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const sellerProductService = {
    getMyProducts,
    deleteMyProduct,
    updateMyProduct,
    createProduct
};