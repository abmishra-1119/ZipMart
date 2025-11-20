import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import couponService from "./couponService";
import { toast } from "react-toastify";

// CREATE COUPON
export const createCoupon = createAsyncThunk(
  "coupon/create",
  async (data, thunkAPI) => {
    try {
      return await couponService.createCoupon(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// GET ALL COUPONS
export const getAllCoupons = createAsyncThunk(
  "coupon/getAll",
  async (params, thunkAPI) => {
    try {
      return await couponService.getAllCoupons(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// GET COUPON BY ID
export const getCouponById = createAsyncThunk(
  "coupon/getById",
  async (id, thunkAPI) => {
    try {
      return await couponService.getCouponById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// GET COUPON BY NAME
export const getCouponByName = createAsyncThunk(
  "coupon/getByName",
  async (name, thunkAPI) => {
    try {
      return await couponService.getCouponByName(name);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// UPDATE COUPON
export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await couponService.updateCoupon(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// DELETE COUPON
export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id, thunkAPI) => {
    try {
      return await couponService.deleteCoupon(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// TOGGLE COUPON STATUS
export const toggleCouponStatus = createAsyncThunk(
  "coupon/toggle",
  async (id, thunkAPI) => {
    try {
      return await couponService.toggleCouponStatus(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// VALIDATE COUPON
export const validateCoupon = createAsyncThunk(
  "coupon/validate",
  async (data, thunkAPI) => {
    try {
      return await couponService.validateCoupon(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// GET ACTIVE COUPONS
export const getActiveCoupons = createAsyncThunk(
  "coupon/getActive",
  async (params, thunkAPI) => {
    try {
      return await couponService.getActiveCoupons(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    coupons: [],
    activeCoupons: [],
    selectedCoupon: null,
    couponDetails: null,
    validatedCoupon: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCouponState: (state) => {
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE COUPON
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        toast.success("Coupon created successfully");
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        toast.error(state.error);
      })

      // GET ALL COUPONS
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload?.data?.coupons || [];
      })
      .addCase(getAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // GET COUPON BY ID
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.couponDetails = action.payload?.data;
      })

      // UPDATE COUPON
      .addCase(updateCoupon.fulfilled, (state) => {
        toast.success("Coupon updated successfully");
      })

      // DELETE COUPON
      .addCase(deleteCoupon.fulfilled, (state) => {
        toast.success("Coupon deleted successfully");
      })

      // TOGGLE COUPON STATUS
      .addCase(toggleCouponStatus.fulfilled, (state) => {
        toast.success("Coupon status updated");
      })

      // VALIDATE COUPON
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.validatedCoupon = action.payload?.data;
      })

      // GET ACTIVE COUPONS
      .addCase(getActiveCoupons.fulfilled, (state, action) => {
        state.activeCoupons = action.payload?.data?.coupons || [];
      });
  },
});

export const { resetCouponState } = couponSlice.actions;
export default couponSlice.reducer;
