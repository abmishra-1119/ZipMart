import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        index: true
    },
    expiryDate: {
        type: Date,
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Indexing for faster search
// couponSchema.index({ name: 1 });
// couponSchema.index({ discount: 1 });

export default mongoose.model("Coupon", couponSchema);