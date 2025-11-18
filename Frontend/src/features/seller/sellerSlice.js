import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sellerProductService } from "./sellerService";

// 1. Fetch seller products
export const getMyProducts = createAsyncThunk(
  "seller/getMyProducts",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await sellerProductService.getMyProducts({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2. Delete product
export const deleteMyProduct = createAsyncThunk(
  "seller/deleteMyProduct",
  async (productId, thunkAPI) => {
    try {
      return await sellerProductService.deleteMyProduct(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 3. Update product
export const updateMyProduct = createAsyncThunk(
  "seller/updateMyProduct",
  async ({ productId, productData }, thunkAPI) => {
    try {
      const pro = sellerProductService.updateMyProduct(productId, productData);
      return pro;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 4. Create product
export const createProduct = createAsyncThunk(
  "seller/createProduct",
  async (productData, thunkAPI) => {
    try {
      return await sellerProductService.createProduct(productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 5. Fetch seller orders
export const getMyOrders = createAsyncThunk(
  "seller/getMyOrders",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await sellerProductService.getMyOrders({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 6. Update order status
export const updateOrderStatus = createAsyncThunk(
  "seller/updateOrderStatus",
  async ({ orderId, status }, thunkAPI) => {
    try {
      return await sellerProductService.updateOrderStatus(orderId, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 7. Top selling products (Supports pagination + range)
export const getTopSellingProducts = createAsyncThunk(
  "seller/getTopSellingProducts",
  async ({ page = 1, limit = 10, range = "" } = {}, thunkAPI) => {
    try {
      return await sellerProductService.getTopSellingProducts({
        page,
        limit,
        range,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 8. Total revenue (Supports range)
export const getTotalRevenue = createAsyncThunk(
  "seller/getTotalRevenue",
  async ({ range = "" } = {}, thunkAPI) => {
    try {
      return await sellerProductService.getTotalRevenue({ range });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  products: [],
  //   product: {},
  orders: [],
  topSelling: [],
  totalRevenue: 0,

  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    resetSellerState: () => initialState,
  },
  extraReducers: (builder) => {
    // helper function for reduce code
    const pending = (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    };

    builder
      // Products List
      .addCase(getMyProducts.pending, pending)
      .addCase(getMyProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.products || [];
      })
      .addCase(getMyProducts.rejected, rejected)

      // Delete Product
      .addCase(deleteMyProduct.pending, pending)
      .addCase(deleteMyProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteMyProduct.rejected, rejected)

      // Update Product
      .addCase(updateMyProduct.pending, pending)
      .addCase(updateMyProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updated = action.payload;
        state.products = state.products.map((p) =>
          p._id === updated._id ? updated : p
        );
      })
      .addCase(updateMyProduct.rejected, rejected)

      // Create Product
      .addCase(createProduct.pending, pending)
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products.push(action.payload.product);
      })
      .addCase(createProduct.rejected, rejected)

      // Orders List
      .addCase(getMyOrders.pending, pending)
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;

        state.orders = action.payload.orders || [];
      })
      .addCase(getMyOrders.rejected, rejected)

      // Update Order Status
      .addCase(updateOrderStatus.pending, pending)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        const updated = action.payload;
        state.orders = state.orders.map((order) =>
          order._id === updated._id ? updated : order
        );
      })
      .addCase(updateOrderStatus.rejected, rejected)

      // Top Selling Products
      .addCase(getTopSellingProducts.pending, pending)
      .addCase(getTopSellingProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topSelling = action.payload.products || [];
      })
      .addCase(getTopSellingProducts.rejected, rejected)

      // Total Revenue
      .addCase(getTotalRevenue.pending, pending)
      .addCase(getTotalRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalRevenue = action.payload.totalRevenue || 0;
      })
      .addCase(getTotalRevenue.rejected, rejected);
  },
});

export const { resetSellerState } = sellerSlice.actions;
export default sellerSlice.reducer;
