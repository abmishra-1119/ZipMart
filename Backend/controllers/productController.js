import Product from "../models/Product.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { cloudinaryUploadImg, cloudinaryDeleteImg } from "../config/cloudinary.js";

// Create product with multiple images
export const createProduct = asyncHandler(async(req, res) => {
    const { id } = req.user;
    const { title, description, price, stock, brand, category } = req.body;
    const files = req.files;

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

    const user = await User.findById(id);
    user.productsCount += 1;
    await user.save();

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
        .populate("sellerId", "name email")
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

    // Parse removed images if provided
    let removedImageIds = [];
    if (update.removedImages) {
        try {
            removedImageIds = JSON.parse(update.removedImages);
            delete update.removedImages; // Remove from update object
        } catch (error) {
            console.error('Error parsing removedImages:', error);
        }
    }

    // Handle image removal first
    if (removedImageIds.length > 0) {
        // Delete removed images from Cloudinary
        const imagesToRemove = product.images.filter(img =>
            removedImageIds.includes(img.public_id)
        );

        await Promise.all(
            imagesToRemove.map((img) => cloudinaryDeleteImg(img.public_id))
        );

        // Update images array by removing deleted ones
        product.images = product.images.filter(img =>
            !removedImageIds.includes(img.public_id)
        );
    }

    // Handle new file uploads
    if (files && files.length > 0) {
        const uploadResults = await Promise.all(
            files.map((file) => cloudinaryUploadImg(file.buffer))
        );

        // Add new images to existing ones
        update.images = [...product.images, ...uploadResults];

        // Update thumbnail if new images were uploaded
        if (uploadResults.length > 0 && !update.thumbnail) {
            update.thumbnail = uploadResults[0].url;
        }
    } else {
        // No new files, keep existing images
        update.images = product.images;
    }

    // If thumbnail is explicitly set to empty, set it to first image
    if (update.thumbnail === '' && update.images.length > 0) {
        update.thumbnail = update.images[0].url;
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
export const addRating = asyncHandler(async (req, res) => {
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

    const populatedProduct = await Product.findById(product._id)
        .populate('ratings.postedBy', 'name email')
        .populate("sellerId", "name email")

    return successResponse(res, 200, "Rating updated successfully", populatedProduct);
});

// Get all categories
export const getAllCategories = asyncHandler(async(req, res) => {
    const categories = await Product.distinct('category');
    return successResponse(res, 200, "Fetched all categories successfully", categories);
});