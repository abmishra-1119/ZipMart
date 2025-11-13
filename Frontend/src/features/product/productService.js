import api from "../../utils/axiosInstance.js";

// Get all products with filtering and pagination
const getAllProducts = async ({ limit = 10, page = 1, category = '', brand = '', sortBy = '', order = 'desc' }) => {
    let queryParams = `page=${page}&limit=${limit}`;

    if (category) queryParams += `&category=${category}`;
    if (brand) queryParams += `&brand=${brand}`;
    if (sortBy) queryParams += `&sortBy=${sortBy}&order=${order}`;

    const response = await api.get(`products?${queryParams}`);
    return response.data;
};

// Search products using text index
const searchProduct = async ({ query, limit = 10, page = 1 }) => {
    const response = await api.get(`products/search?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
};

// Get single product by ID
const getProductById = async (productId) => {
    const response = await api.get(`products/${productId}`);
    return response.data;
};

// Get all categories
const getAllCategories = async () => {
    const response = await api.get('products/category');
    return response.data;
};

// Add or update product rating (Protected - User)
const addRating = async (productId, { star, comment }) => {
    const response = await api.post(`products/${productId}/rate`, { star, comment });
    return response.data;
};

export const productService = {
    getAllProducts,
    searchProduct,
    getProductById,
    getAllCategories,
    addRating
};