    import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
    import { authService } from "./authService.js";

    const initialState = {
        isLoading: false,
        users: [],
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem('userToken') || null,
        isAuthenticated: !!localStorage.getItem('userToken'),
        message: '',
        cart: JSON.parse(localStorage.getItem("user"))?.cart || undefined
    }

    // Login
    export const loginUser = createAsyncThunk("user/login", async(userData, { rejectWithValue }) => {
        try {
            return await authService.login(userData);
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });

    // Send Otp
    export const sendOtp = createAsyncThunk("user/send-otp", async(email, { rejectWithValue }) => {
        try {
            return await authService.sendOtp(email);
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });

    // Verify Otp
    export const verifyOtp = createAsyncThunk("user/verify-otp", async(data, { rejectWithValue }) => {
        try {
            return await authService.verifyOtp(data);
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });

    export const forgotPassword = createAsyncThunk("user/forgot-password", async(email, { rejectWithValue }) => {
        try {
            return await authService.forgotPassword(email);
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });

    export const resetPassword = createAsyncThunk("user/reset-password", async(data, { rejectWithValue }) => {
        try {
            return await authService.resetPassword(data);
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });

    export const logout = createAsyncThunk("user/logout", async(_, { rejectWithValue }) => {
        try {
            await authService.logout();
            return true
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
        }
    });


    const authSlice = createSlice({
        name: 'auth',
        initialState,
        reducers: {},
        extraReducers: (builder) => {
            builder
            //Login 
                .addCase(loginUser.pending, (state) => {
                    state.isLoading = true
                }).addCase(loginUser.fulfilled, (state, action) => {
                    state.isLoading = false
                    state.user = action.payload.user
                    state.cart = action.payload.user.cart
                    state.isAuthenticated = true
                    state.token = action.payload.token
                    state.message = ''
                }).addCase(loginUser.rejected, (state, action) => {
                    state.isLoading = false
                    state.message = action.payload
                })
                //Send-Otp 
                .addCase(sendOtp.pending, (state) => {
                    state.isLoading = true
                }).addCase(sendOtp.fulfilled, (state, action) => {
                    state.isLoading = false
                    state.message = ''
                }).addCase(sendOtp.rejected, (state, action) => {
                    state.isLoading = false
                    state.message = action.payload
                })
                //Forgot Password 
                .addCase(forgotPassword.pending, (state) => {
                    state.isLoading = true
                }).addCase(forgotPassword.fulfilled, (state, action) => {
                    state.isLoading = false
                    state.message = ''
                }).addCase(forgotPassword.rejected, (state, action) => {
                    state.isLoading = false
                    state.message = action.payload
                })
                // Logout 
                .addCase(logout.pending, (state) => {
                    state.isLoading = true
                }).addCase(logout.fulfilled, (state, action) => {
                    state.isLoading = false
                    state.message = ''
                    state.user = null;
                    state.token = null;
                    state.isAuthenticated = false;
                    state.cart = undefined
                }).addCase(logout.rejected, (state, action) => {
                    state.isLoading = false
                    state.message = action.payload
                })
        }
    })


    export default authSlice.reducer