import api from "../../utils/axiosInstance.js";

// Update any product (admin only)
const updateProduct = async (productId, productData) => {
    const response = await api.put(`products/${productId}`, productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Delete any product (admin only)
const deleteProduct = async (productId) => {
    const response = await api.delete(`products/${productId}`);
    return response.data;
};

export const adminProductService = {
    updateProduct,
    deleteProduct
};