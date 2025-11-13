import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function(v) {
                const user = await mongoose.model('User').findById(v);
                return !!user;
            },
            message: "Please enter a valid User ID"
        }
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            validate: {
                validator: async function(v) {
                    const product = await mongoose.model('Product').findById(v);
                    return !!product;
                },
                message: "Please enter a valid Product ID"
            },
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        count: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        _id: false
    }],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    finalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'UPI', 'Credit-Card', 'Debit-Card', 'EMI'],
        default: 'COD'
    },
    address: {
        house: { type: String, required: true },
        street: { type: String },
        landmark: { type: String },
        pincode: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: 'India' },
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'cancelled', 'delivered', 'refund', 'refunded'],
        default: 'pending'
    },
    refundProcess: {
        type: String,
        enum: ['processing', 'initiated', 'cancelled', 'done'],
    },
    refundTime: Date,
    refundMsg: String,
}, { timestamps: true });

// Indexing for faster queries
orderSchema.index({ user: 1, orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'products.productId': 1 });

export default mongoose.model('Order', orderSchema);