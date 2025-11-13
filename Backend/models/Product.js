import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    star: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, "Title must be at least 3 characters"],
        maxLength: [100, "Title too long"],
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: [5, "Description must be at least 5 characters"],
        maxLength: [500, "Description too long"],
        index: true,
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"],
    },
    stock: {
        type: Number,
        default: 0,
    },
    sold: {
        type: Number
    },
    brand: {
        type: String,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        trim: true,
        index: true,
    },
    images: [{
        url: String,
        asset_id: String,
        public_id: String,
    }, ],
    ratings: [ratingSchema],
    totalRating: {
        type: Number,
        default: 0,
    },
    thumbnail: String,
}, { timestamps: true });

// Indexes for faster searching
ProductSchema.index({ title: "text", description: "text", brand: 1, category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sold: 1 })
ProductSchema.index({ stock: 1 })
ProductSchema.index({ totalRating: 1 })
ProductSchema.index({ brand: 'text', category: 'text' })

export default mongoose.model("Product", ProductSchema);