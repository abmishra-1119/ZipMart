import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import productSlice from "../features/product/productSlice";
import addressSlice from "../features/addresses/addressSlice";
import orderSlice from "../features/orders/orderSlice";
import sellerSlice from "../features/seller/sellerSlice";
import adminSlice from "../features/admin/adminSlice";
import couponSlice from "../features/coupons/couponSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    addresses: addressSlice,
    orders: orderSlice,
    seller: sellerSlice,
    admin: adminSlice,
    coupon: couponSlice,
  },
});
