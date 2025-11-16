import api from "../../utils/axiosInstance";

// Add New Address
const addAddress = async (data) => {
    const res = await api.post("users/address/add", data);
    return res.data;
};

// Get My Addresses
const getAddresses = async () => {
    const res = await api.get("users/address");
    return res.data;
};

// Update Address by Index
const updateAddress = async (index, data) => {
    const res = await api.put(`users/address/${index}`, data);
    return res.data;
};

// Delete Address by Index
const deleteAddress = async (index) => {
    const res = await api.delete(`users/address/${index}`);
    return res.data;
};

// Set Default Address
const setDefaultAddress = async (index) => {
    const res = await api.put(`users/address/default/${index}`);
    return res.data;
};


export const addressService = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};