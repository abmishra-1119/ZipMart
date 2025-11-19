import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "./orderService.js";

// CREATE ORDER
export const createOrder = createAsyncThunk(
    "order/create",
    async (orderData, { rejectWithValue }) => {
        try {
            return await orderService.createOrder(orderData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Order creation failed");
        }
    }
);

// GET MY ORDERS
export const getMyOrders = createAsyncThunk(
    "order/getMy",
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getMyOrders();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch orders");
        }
    }
);

// GET ORDER BY ID
export const getOrderById = createAsyncThunk(
    "order/getById",
    async (orderId, { rejectWithValue }) => {
        try {
            return await orderService.getOrderById(orderId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch order");
        }
    }
);

// CANCEL ORDER
export const cancelOrder = createAsyncThunk(
    "order/cancel",
    async (orderId, { rejectWithValue }) => {
        try {
            return await orderService.cancelOrder(orderId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Cancel failed");
        }
    }
);

// VALIDATE COUPON
export const validateCoupon = createAsyncThunk(
    "order/validateCoupon",
    async (couponCode, { rejectWithValue }) => {
        try {
            return await orderService.validateCoupon(couponCode);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Coupon validation failed");
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        // Add coupon state
        coupon: null,
        totalAfterDiscount: 0,
        couponLoading: false,
    },
    reducers: {
        clearCoupon: (state) => {
            state.coupon = null;
            state.totalAfterDiscount = 0;
        },
        setDiscountTotal: (state, action) => {
            state.totalAfterDiscount = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder

            // CREATE ORDER
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders.unshift(action.payload.order);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET ORDERS
            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET ORDER BY ID
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // CANCEL ORDER
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) state.orders[index] = action.payload;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // VALIDATE COUPON
            .addCase(validateCoupon.pending, (state) => {
                state.couponLoading = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.couponLoading = false;
                state.coupon = action.payload;
                // Calculate discounted total if you have the subtotal available
                // You might want to pass subtotal as a parameter or calculate in component
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.couponLoading = false;
                state.error = action.payload;
                state.coupon = null;
            });
    },
});

export const { clearCoupon, setDiscountTotal } = orderSlice.actions;
export default orderSlice.reducer;
