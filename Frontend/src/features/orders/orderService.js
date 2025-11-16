import api from "../../utils/axiosInstance";

// CREATE ORDER
const createOrder = async (orderData) => {
    const res = await api.post("/orders", orderData);
    return res.data;
};

// GET MY ORDERS
const getMyOrders = async () => {
    const res = await api.get("/orders/my");
    return res.data;
};

// GET ORDERS BY ID 
const getOrderById = async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
};

// CANCEL ORDER
const cancelOrder = async (orderId) => {
    const res = await api.put(`/orders/cancel/${orderId}`);
    return res.data;
};

const validateCoupon = async (couponCode) => {
    const res = await api.post("/coupons/validate", { code: couponCode });
    return res.data;
}


export const orderService = {
    createOrder,
    getMyOrders,
    cancelOrder,
    validateCoupon,
    getOrderById
};