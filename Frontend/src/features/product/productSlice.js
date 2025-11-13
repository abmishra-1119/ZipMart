import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {productService} from "./productService.js";

const initialState = {
    isLoading: false,
    products :[],
    message :''
}

export const getAllProducts = createAsyncThunk('products',async({limit= 10, page=1,query ='' },{rejectWithValue})=>{
    try{
        return await productService.getAllProducts({limit, page,query  })
    } catch (error) {
        return rejectWithValue(error.response.data.message || 'Something went wrong. Please try again.');
    }
} )


const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(getAllProducts.pending, (state) => {
                state.isLoading = true
            }).addCase(getAllProducts.fulfilled, (state, action) => {
            state.isLoading = false
            state.products = action.payload
            state.message = ''
        }).addCase(getAllProducts.rejected, (state, action) => {
            state.isLoading = false
            state.message = action.payload
        })
    }
})

export default productSlice.reducer