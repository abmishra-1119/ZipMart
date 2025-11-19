import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressService } from "./addressService.js";
// ADD ADDRESS
export const addAddress = createAsyncThunk(
  "address/add",
  async (data, { rejectWithValue }) => {
    try {
      console.log(data);
      return await addressService.addAddress(data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add address"
      );
    }
  }
);

// GET ALL ADDRESSES
export const getAddresses = createAsyncThunk(
  "address/get",
  async (_, { rejectWithValue }) => {
    try {
      return await addressService.getAddresses();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch addresses"
      );
    }
  }
);

// UPDATE ADDRESS
export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ index, data }, { rejectWithValue }) => {
    try {
      return await addressService.updateAddress(index, data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update address"
      );
    }
  }
);

// DELETE ADDRESS
export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (index, { rejectWithValue }) => {
    try {
      return await addressService.deleteAddress(index);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete address"
      );
    }
  }
);

// SET DEFAULT ADDRESS
export const setDefaultAddress = createAsyncThunk(
  "address/default",
  async (index, { rejectWithValue }) => {
    try {
      return await addressService.setDefaultAddress(index);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to set default"
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(addAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
      })

      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
      });
  },
});

export default addressSlice.reducer;
