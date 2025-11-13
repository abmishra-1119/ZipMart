import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { cloudinaryUploadImg, cloudinaryDeleteImg } from "../config/cloudinary.js";

// Create product with multiple images
export const createProduct = asyncHandler(async(req, res) => {
    const { id } = req.user;
    const { title, description, price, stock, brand, category } = req.body;
    const files = req.files;

    console.log(files);

    if (!title || !description || !price || !stock || !files.length) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const uploadResults = await Promise.all(
        files.map((file) => cloudinaryUploadImg(file.buffer))
    );

    // console.log(uploadResults);


    const newProduct = await Product.create({
        sellerId: id,
        title,
        description,
        price,
        stock,
        brand,
        category,
        images: uploadResults,
        thumbnail: uploadResults[0].url || "",
    });

    return successResponse(res, 201, "Product created successfully", newProduct);
});

// Get all products with filtering and pagination
export const getAllProducts = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, brand, sortBy, order = "desc" } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    const sortOption = {};
    if (sortBy) {
        if (sortBy === "rating") {
            sortOption["totalRating"] = order === "asc" ? 1 : -1;
        } else {
            sortOption[sortBy] = order === "asc" ? 1 : -1;
        }
    }

    const products = await Product.find(filter)
        .select("-__v -updatedAt")
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        // .hint({ category: 1, brand: 1 });

    const totalProducts = await Product.countDocuments(filter);

    return successResponse(res, 200, "Products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

// Search products using text index
export const searchProduct = asyncHandler(async(req, res) => {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ $text: { $search: query } })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)

    const totalProducts = await Product.countDocuments({ $text: { $search: query } });

    if (!products.length) {
        res.status(404);
        throw new Error("No products found for this search query");
    }

    return successResponse(res, 200, "Search results", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

// Get single product by ID
export const getProductById = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
        .populate("sellerId", "name email")
        .populate("ratings.postedBy", "name email");

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    return successResponse(res, 200, "Product fetched successfully", product);
});

// Update product (admin/seller)
export const updateProduct = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const update = req.body;
    const files = req.files;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if (files.length) {
        await Promise.all(
            product.images.map((img) => cloudinaryDeleteImg(img.public_id))
        );
        const uploadResults = await Promise.all(
            files.map((file) => cloudinaryUploadImg(file.buffer))
        );
        update.images = uploadResults;
        update.thumbnail = uploadResults[0].url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
        new: true,
    });

    return successResponse(res, 200, "Product updated successfully", updatedProduct);
});

// Delete product
export const deleteProduct = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    await Promise.all(product.images.map((img) => cloudinaryDeleteImg(img.public_id)));
    await product.deleteOne();

    return successResponse(res, 200, "Product deleted successfully");
});

// Get seller's products
export const getMyProduct = asyncHandler(async(req, res) => {
    const { id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ sellerId: id })
        .select("-__v -createdAt -updatedAt")
        .skip(skip)
        .limit(limit)
        .hint({ sellerId: 1 });

    const totalProducts = await Product.countDocuments({ sellerId: id });

    return successResponse(res, 200, "My products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

// Delete seller's product
export const deleteMyProduct = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, sellerId: userId });
    if (!product) {
        res.status(404);
        throw new Error("No product found or unauthorized access");
    }
    return successResponse(res, 200, "Product deleted successfully");
});

// Update seller's product
export const updateMyProduct = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const update = req.body;
    const product = await Product.findOneAndUpdate({ _id: id, sellerId: userId }, update, { new: true });
    if (!product) {
        res.status(404);
        throw new Error("No product found or unauthorized access");
    }
    return successResponse(res, 200, "Product updated successfully", product);
});

// Add or update product rating
export const addRating = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const { star, comment } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    const existingRating = product.ratings.find(
        (r) => r.postedBy.toString() === userId.toString()
    );

    if (existingRating) {
        existingRating.star = star;
        existingRating.comment = comment;
    } else {
        product.ratings.push({ star, comment, postedBy: userId });
    }

    const totalRating = product.ratings.reduce((acc, item) => acc + item.star, 0);
    product.totalRating = totalRating / product.ratings.length;

    await product.save();

    return successResponse(res, 200, "Rating updated successfully", product);
});

// Get all categories
export const getAllCategories = asyncHandler(async(req, res) => {
    const categories = await Product.distinct('category');
    return successResponse(res, 200, "Fetched all categories successfully", categories);
});