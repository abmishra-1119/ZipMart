import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService.js";

const initialState = {
  isLoading: false,
  users: [],
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("userToken") || null,
  isAuthenticated: !!localStorage.getItem("userToken"),
  message: "",
  cart: JSON.parse(localStorage.getItem("user"))?.cart || undefined,
};

// Login
export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      console.log(error);

      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Send Otp
export const sendOtp = createAsyncThunk(
  "user/send-otp",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.sendOtp(email);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Verify Otp
export const verifyOtp = createAsyncThunk(
  "user/verify-otp",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.verifyOtp(data);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgot-password",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/reset-password",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(data);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Update user details
export const updateUser = createAsyncThunk(
  "user/update",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.updateUser(userData);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Get current user profile
export const getProfile = createAsyncThunk(
  "user/profile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Get user cart
export const getCart = createAsyncThunk(
  "user/get-cart",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Add product to cart
export const addToCart = createAsyncThunk(
  "user/add-to-cart",
  async ({ productId, count = 1 }, { rejectWithValue }) => {
    try {
      return await authService.addToCart(productId, count);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Remove product from cart
export const removeFromCart = createAsyncThunk(
  "user/remove-from-cart",
  async (productId, { rejectWithValue }) => {
    try {
      return await authService.removeFromCart(productId);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Empty user cart
export const emptyCart = createAsyncThunk(
  "user/empty-cart",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.emptyCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "user/update-cart-item",
  async ({ productId, count }, { rejectWithValue }) => {
    try {
      return await authService.updateCartItem(productId, count);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  "user/change-password",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      return await authService.changePassword(oldPassword, newPassword);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

// Upload user avatar
export const uploadAvatar = createAsyncThunk(
  "user/upload-avatar",
  async (avatarFile, { rejectWithValue }) => {
    try {
      return await authService.uploadAvatar(avatarFile);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = "";
    },
    updateCartLocally: (state, action) => {
      if (state.user) {
        state.cart = action.payload;
        const updatedUser = { ...state.user, cart: action.payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        state.user = updatedUser;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.cart = action.payload.user.cart;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.message = "";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Send-Otp
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "";
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.cart = undefined;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.cart = action.payload.cart;
        state.message = "";
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.cartStatus = "loading";
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.cartStatus = "success";
        state.cart = action.payload;
        state.message = "";
      })
      .addCase(getCart.rejected, (state, action) => {
        state.cartStatus = "failed";
        state.message = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        if (state.user) {
          state.user = { ...state.user, cart: action.payload };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })

      // Update Cart Item Quantity
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        if (state.user) {
          state.user = { ...state.user, cart: action.payload };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })

      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        if (state.user) {
          state.user = { ...state.user, cart: action.payload };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })

      // Empty Cart
      .addCase(emptyCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        if (state.user) {
          state.user = { ...state.user, cart: action.payload };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        // state.message = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, avatar: action.payload };
        // state.message = "Avatar uploaded successfully";
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      });
  },
});

export const { clearMessage, updateCartLocally } = authSlice.actions;
export default authSlice.reducer;
