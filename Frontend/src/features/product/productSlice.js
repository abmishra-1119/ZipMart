import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "./productService.js";

const initialState = {
    isLoading: false,
    products: [],
    product: null,
    categories: [],
    searchResults: [],
    message: '',
    pagination: {
        page: 1,
        limit: 10,
        totalProducts: 0,
        totalPages: 0
    }
}

// Get all products with filtering and pagination
export const getAllProducts = createAsyncThunk('products/get-all', async ({ limit = 10, page = 1, category = '', brand = '', sortBy = '', order = 'desc' }, { rejectWithValue }) => {
    try {
        return await productService.getAllProducts({ limit, page, category, brand, sortBy, order });
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
});

// Search products
export const searchProduct = createAsyncThunk('products/search', async ({ query, limit = 10, page = 1 }, { rejectWithValue }) => {
    try {
        return await productService.searchProduct({ query, limit, page });
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
});

// Get single product by ID
export const getProductById = createAsyncThunk('products/get-by-id', async (productId, { rejectWithValue }) => {
    try {
        return await productService.getProductById(productId);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
});

// Get all categories
export const getAllCategories = createAsyncThunk('products/get-categories', async (_, { rejectWithValue }) => {
    try {
        return await productService.getAllCategories();
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
});

// Add or update product rating
export const addRating = createAsyncThunk('products/add-rating', async ({ productId, ratingData }, { rejectWithValue }) => {
    try {
        return await productService.addRating(productId, ratingData);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
});

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearMessage: (state) => {
            state.message = '';
        },
        clearProduct: (state) => {
            state.product = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        updateProductInList: (state, action) => {
            const updatedProduct = action.payload;
            const index = state.products.findIndex(product => product._id === updatedProduct._id);
            if (index !== -1) {
                state.products[index] = updatedProduct;
            }
            if (state.product && state.product._id === updatedProduct._id) {
                state.product = updatedProduct;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Get All Products
            .addCase(getAllProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data.products;
                state.pagination = {
                    page: action.payload.data.page,
                    limit: action.payload.data.limit,
                    totalProducts: action.payload.data.totalProducts,
                    totalPages: action.payload.data.totalPages
                };
                state.message = '';
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload;
            })
            // Search Products
            .addCase(searchProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(searchProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.searchResults = action.payload.data.products;
                state.pagination = {
                    page: action.payload.data.page,
                    limit: action.payload.data.limit,
                    totalProducts: action.payload.data.totalProducts,
                    totalPages: action.payload.data.totalPages
                };
                state.message = '';
            })
            .addCase(searchProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload;
            })
            // Get Product By ID
            .addCase(getProductById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload.data;
                state.message = '';
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload;
            })
            // Get All Categories
            .addCase(getAllCategories.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload.data;
                state.message = '';
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload;
            })
            // Add Rating
            .addCase(addRating.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addRating.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the product in state if it's currently loaded
                if (state.product && state.product._id === action.meta.arg.productId) {
                    state.product = action.payload.data;
                }
                // Update product in products list if it exists
                const productIndex = state.products.findIndex(
                    product => product._id === action.meta.arg.productId
                );
                if (productIndex !== -1) {
                    state.products[productIndex] = action.payload.data;
                }
                state.message = 'Rating added successfully';
            })
            .addCase(addRating.rejected, (state, action) => {
                state.isLoading = false;
                state.message = action.payload;
            });
    }
});

export const { clearMessage, clearProduct, clearSearchResults, updateProductInList } = productSlice.actions;
export default productSlice.reducer;