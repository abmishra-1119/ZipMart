import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminProductService } from "./adminService";

// create User for admin
export const adminCreateUser = createAsyncThunk(
  "admin/createUser",
  async (userData, thunkAPI) => {
    try {
      return await adminProductService.createUser(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all users
export const adminGetAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await adminProductService.getAllUsers({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all sellers
export const adminGetAllSellers = createAsyncThunk(
  "admin/getAllSellers",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await adminProductService.getAllSellers({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get user by ID
export const adminGetUserById = createAsyncThunk(
  "admin/getUserById",
  async (userId, thunkAPI) => {
    try {
      return await adminProductService.getUserById(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete user by ID
export const adminDeleteUserById = createAsyncThunk(
  "admin/deleteUserById",
  async (userId, thunkAPI) => {
    try {
      return await adminProductService.deleteUserById(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update any product
export const adminUpdateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ productId, productData }, thunkAPI) => {
    try {
      return await adminProductService.updateProduct(productId, productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete product
export const adminDeleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (productId, thunkAPI) => {
    try {
      return await adminProductService.deleteProduct(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all orders
export const adminGetAllOrders = createAsyncThunk(
  "admin/getAllOrders",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await adminProductService.getAllOrders({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update refund
export const adminUpdateRefund = createAsyncThunk(
  "admin/updateRefund",
  async ({ orderId, status }, thunkAPI) => {
    try {
      return await adminProductService.updateRefund(orderId, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete order
export const adminDeleteOrder = createAsyncThunk(
  "admin/deleteOrder",
  async (orderId, thunkAPI) => {
    try {
      return await adminProductService.deleteOrder(orderId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Top selling
export const adminGetTopSellingProducts = createAsyncThunk(
  "admin/getTopSellingProducts",
  async ({ page, limit, range }, thunkAPI) => {
    try {
      return await adminProductService.getTopSellingProducts({
        page,
        limit,
        range,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Total Revenue
export const adminGetTotalRevenue = createAsyncThunk(
  "admin/getTotalRevenue",
  async ({ range }, thunkAPI) => {
    try {
      return await adminProductService.getTotalRevenue({ range });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Top customers
export const adminGetTopCustomers = createAsyncThunk(
  "admin/getTopCustomers",
  async ({ limit, range }, thunkAPI) => {
    try {
      return await adminProductService.getTopCustomers({ limit, range });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Top sellers
export const adminGetTopSellers = createAsyncThunk(
  "admin/getTopSellers",
  async ({ limit, range }, thunkAPI) => {
    try {
      return await adminProductService.getAdminTopSellingProducts({
        limit,
        range,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Order status summary
export const adminGetOrderStatusSummary = createAsyncThunk(
  "admin/getOrderStatusSummary",
  async (_, thunkAPI) => {
    try {
      return await adminProductService.getOrderStatusSummary();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get orders by User ID (Admin)
export const adminGetOrdersByUserId = createAsyncThunk(
  "admin/getOrdersByUserId",
  async (userId, thunkAPI) => {
    try {
      return await adminProductService.adminGetOrdersByUserId(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const adminGetOrdersBId = createAsyncThunk(
  "admin/getOrdersBId",
  async (userId, thunkAPI) => {
    try {
      return await adminProductService.adminGetOrdersBId(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get products by seller ID
export const adminGetSellerProducts = createAsyncThunk(
  "admin/getSellerProducts",
  async ({ sellerId, limit = 10, page = 1 }, thunkAPI) => {
    try {
      return await adminProductService.getSellerProducts(sellerId, {
        limit,
        page,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get Order by seller ID
export const adminGetSellerOrders = createAsyncThunk(
  "admin/getSellerOrders",
  async ({ sellerId, limit = 10, page = 1 }, thunkAPI) => {
    try {
      return await adminProductService.adminGetSellerOrders({
        sellerId,
        limit,
        page,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Toggle User Status (Admin)
export const adminToggleUserStatus = createAsyncThunk(
  "admin/updateStatus",
  async (id, { rejectWithValue }) => {
    try {
      return await adminProductService.adminToggleUserStatus(id);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  users: [],
  sellers: [],
  userDetails: null,
  products: [],
  orders: [],
  userOrders: [],

  topSelling: [],
  totalRevenue: 0,
  topCustomers: [],
  topSellers: [],
  orderSummary: {},
  orderDetails: {},

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    resetAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.isLoading = true;
      state.isError = false;
      state.message = "";
    };

    const rejected = (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    };

    builder
      // create user
      .addCase(adminCreateUser.pending, pending)
      .addCase(adminCreateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(adminCreateUser.rejected, rejected)

      // get all users
      .addCase(adminGetAllUsers.pending, pending)
      .addCase(adminGetAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
      })
      .addCase(adminGetAllUsers.rejected, rejected)

      // get all sellers
      .addCase(adminGetAllSellers.pending, pending)
      .addCase(adminGetAllSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellers = action.payload.sellers || [];
      })
      .addCase(adminGetAllSellers.rejected, rejected)

      // get user by id
      .addCase(adminGetUserById.pending, pending)
      .addCase(adminGetUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userDetails = action.payload || null;
      })
      .addCase(adminGetUserById.rejected, rejected)

      // delete user
      .addCase(adminDeleteUserById.pending, pending)
      .addCase(adminDeleteUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.meta.arg;
        state.sellers = state.sellers.filter((u) => u._id !== id);
      })
      .addCase(adminDeleteUserById.rejected, rejected)

      // update product
      .addCase(adminUpdateProduct.pending, pending)
      .addCase(adminUpdateProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(adminUpdateProduct.rejected, rejected)

      // delete product
      .addCase(adminDeleteProduct.pending, pending)
      .addCase(adminDeleteProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(adminDeleteProduct.rejected, rejected)

      // get all orders
      .addCase(adminGetAllOrders.pending, pending)
      .addCase(adminGetAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(adminGetAllOrders.rejected, rejected)

      // update refund
      .addCase(adminUpdateRefund.pending, pending)
      .addCase(adminUpdateRefund.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.order;
        state.orders = state.orders.map((o) =>
          o._id === updated._id ? updated : o
        );
      })
      .addCase(adminUpdateRefund.rejected, rejected)

      // delete order
      .addCase(adminDeleteOrder.pending, pending)
      .addCase(adminDeleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.meta.arg;
        state.orders = state.orders.filter((o) => o._id !== id);
      })
      .addCase(adminDeleteOrder.rejected, rejected)

      // top selling
      .addCase(adminGetTopSellingProducts.pending, pending)
      .addCase(adminGetTopSellingProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topSelling = action.payload.products || [];
      })
      .addCase(adminGetTopSellingProducts.rejected, rejected)

      // total revenue
      .addCase(adminGetTotalRevenue.pending, pending)
      .addCase(adminGetTotalRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalRevenue = action.payload.totalRevenue || 0;
      })
      .addCase(adminGetTotalRevenue.rejected, rejected)

      // top customers
      .addCase(adminGetTopCustomers.pending, pending)
      .addCase(adminGetTopCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topCustomers = action.payload.topCustomers || [];
      })
      .addCase(adminGetTopCustomers.rejected, rejected)

      // top sellers
      .addCase(adminGetTopSellers.pending, pending)
      .addCase(adminGetTopSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topSellers = action.payload.topSellers || [];
      })
      .addCase(adminGetTopSellers.rejected, rejected)

      // order status summary
      .addCase(adminGetOrderStatusSummary.pending, pending)
      .addCase(adminGetOrderStatusSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderSummary = action.payload.statusSummary || {};
      })
      .addCase(adminGetOrderStatusSummary.rejected, rejected)

      // get orders by user id
      .addCase(adminGetOrdersByUserId.pending, pending)
      .addCase(adminGetOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log(action);
        state.userOrders = action.payload || [];
      })
      .addCase(adminGetOrdersByUserId.rejected, rejected)

      // get order by ID
      .addCase(adminGetOrdersBId.pending, pending)
      .addCase(adminGetOrdersBId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload || {};
      })
      .addCase(adminGetOrdersBId.rejected, rejected)
      // Add this to the extraReducers in adminSlice
      .addCase(adminGetSellerProducts.pending, pending)
      .addCase(adminGetSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
      })
      .addCase(adminGetSellerProducts.rejected, rejected)

      .addCase(adminGetSellerOrders.pending, pending)
      .addCase(adminGetSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(adminGetSellerOrders.rejected, rejected)
      // Toggle
      .addCase(adminToggleUserStatus.pending, pending)
      .addCase(adminToggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Update the user status in userDetails
        if (state.userDetails && state.userDetails._id === action.meta.arg) {
          state.userDetails.isActive = action.payload.isActive;
        }

        // Also update in sellers list if needed
        state.sellers = state.sellers.map((seller) =>
          seller._id === action.meta.arg
            ? { ...seller, isActive: action.payload.isActive }
            : seller
        );
      })
      .addCase(adminToggleUserStatus.rejected, rejected);
  },
});

export const { resetAdminState } = adminSlice.actions;
export default adminSlice.reducer;
