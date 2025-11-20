import api from "../../utils/axiosInstance";

const createCoupon = async (data) => {
  const res = await api.post("coupons", data);
  return res.data;
};

const getAllCoupons = async (params) => {
  const res = await api.get("coupons", { params });
  return res.data;
};

const getCouponById = async (id) => {
  const res = await api.get(`coupons/${id}`);
  return res.data;
};

const getCouponByName = async (name) => {
  const res = await api.get(`coupons/name/${name}`);
  return res.data;
};

const updateCoupon = async (id, data) => {
  const res = await api.put(`coupons/${id}`, data);
  return res.data;
};

const deleteCoupon = async (id) => {
  const res = await api.delete(`coupons/${id}`);
  return res.data;
};

const toggleCouponStatus = async (id) => {
  const res = await api.put(`coupons/${id}/toggle`);
  return res.data;
};

const validateCoupon = async (data) => {
  const res = await api.post("coupons/validate", data);
  return res.data;
};

const getActiveCoupons = async (params) => {
  const res = await api.get("coupons/active", { params });
  return res.data;
};

const couponService = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByName,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
  getActiveCoupons,
};

export default couponService;
