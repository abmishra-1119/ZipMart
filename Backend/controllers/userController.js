import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendForgotPasswordOtp, sendOtpEmail } from "../utils/mailer.js";
import Otp from "../models/Otp.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { cloudinaryDeleteImg, cloudinaryUploadImg } from "../config/cloudinary.js";

// Send OTP for email verification
export const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await Otp.deleteMany({ email });
    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);
    successResponse(res, 200, "OTP sent to email");
});

// Verify OTP and complete registration
export const verifyOtpAndRegister = asyncHandler(async (req, res) => {
    const { name, email, password, otp } = req.body;

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP expired or not found" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User(req.body);
    await user.save();

    await Otp.deleteMany({ email });
    successResponse(res, 201, "User registered successfully", {
        name: user.name,
        email: user.email,
        role: user.role,
    });
});

// Create new user (admin only)
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" });

    const find = await User.findOne({ email });
    if (find) return res.status(400).json({ message: "Email is already registered" });

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    successResponse(res, 201, "User created successfully", {
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role,
    });
});

// User login with JWT tokens
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);

    const find = await User.findOne({ email });
    const userAgent = req.headers["user-agent"];



    if (!find) return res.status(404).json({ error: "Invalid email address" });

    const isValid = await bcrypt.compare(password, find.password);
    if (!isValid) return res.status(401).json({ error: "Invalid password" });

    const accessToken = jwt.sign({ id: find._id }, process.env.ACCESS_KEY, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: find._id }, process.env.REFRESH_KEY, { expiresIn: "7d" });

    find.refreshTokens.push({ token: refreshToken, userAgent });
    await find.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, 200, "Login successful", {
        token: accessToken,
        user: { name: find.name, email: find.email, role: find.role, cart: find.cart },
    });
});

// Logout user and clear tokens
export const logoutUser = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    const user = await User.findOne({ "refreshTokens.token": refreshToken });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.refreshTokens = user.refreshTokens.filter(
        (item) => item.token !== refreshToken
    );
    await user.save();

    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax", // or "none" if cross-origin + HTTPS
        secure: process.env.NODE_ENV === "production",
    });

    successResponse(res, 200, "Logged out successfully");
});


// Refresh access token using refresh token
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const storedToken = user.refreshTokens.find((t) => t.token === refreshToken);
    if (!storedToken) return res.status(403).json({ message: "Invalid token" });

    const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_KEY, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_KEY, { expiresIn: "7d" });

    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    user.refreshTokens.push({
        token: newRefreshToken,
        userAgent: storedToken.userAgent,
        createdAt: new Date(),
    });
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, 200, "Token refreshed", { accessToken: newAccessToken });
});

// Get paginated users list
export const getUser = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find({}, "name email age role createdAt").skip(skip).limit(limit),
        User.countDocuments(),
    ]);

    successResponse(res, 200, "Users fetched successfully", {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
    });
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).select("name email age role createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    successResponse(res, 200, "User fetched successfully", user);
});

// Update user details
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const updated = await User.findByIdAndUpdate(id, req.body, { new: true }).select(
        "name email age role updatedAt"
    );

    if (!updated) return res.status(404).json({ message: "User not found" });
    successResponse(res, 200, "User updated successfully", updated);
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    successResponse(res, 200, "User deleted successfully");
});

// Get current user profile
export const profile = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).select("name email age role cart");
    successResponse(res, 200, "Profile fetched successfully", user);
});

// Get user cart
export const getCart = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).select("cart");
    successResponse(res, 200, "Cart fetched successfully", user.cart);
});

// Add product to cart
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, count = 1 } = req.body;
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingProduct = user.cart.find((item) => item.productId.toString() === productId);
    if (existingProduct) existingProduct.count += count;
    else user.cart.push({ productId, count });

    await user.save();
    successResponse(res, 200, "Product added/updated in cart", user.cart);
});

// Remove product from cart
export const deleteFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { id } = req.user;

    const user = await User.findByIdAndUpdate(
        id, { $pull: { cart: { productId } } }, { new: true }
    ).select("cart");

    successResponse(res, 200, "Product removed from cart", user.cart);
});

// Empty user cart
export const emptyCart = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(id, { cart: [] }, { new: true }).select("cart");
    successResponse(res, 200, "Cart emptied", user.cart);
});

// Update cart item quantity
export const updateCart = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { productId, count } = req.body;

    if (!productId || !count)
        return res.status(400).json({ message: "productId and count are required" });

    const user = await User.findOneAndUpdate({ _id: id, "cart.productId": productId }, { $set: { "cart.$.count": count } }, { new: true }).select("cart");

    if (!user) return res.status(404).json({ message: "User not found or product not in cart" });

    successResponse(res, 200, "Cart updated successfully", user.cart);
});

// Get all sellers
export const getAllSeller = asyncHandler(async (req, res) => {
    const sellers = await User.find({ role: "seller" }).select("name email role createdAt");
    successResponse(res, 200, "All sellers fetched", sellers);
});

// Send forgot password OTP
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid email address" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await Otp.deleteMany({ email });
    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendForgotPasswordOtp(email, otp);
    successResponse(res, 200, "OTP sent for password reset");
});

// Reset password with OTP verification
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body;
    console.log(req.body);

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP expired or not found" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    successResponse(res, 200, "Password reset successfully");
});

// Change password with old password verification
export const changePassword = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    successResponse(res, 200, "Password changed successfully");
});

// Upload user avatar to Cloudinary
export const uploadAvatar = asyncHandler(async (req, res) => {
    const { id } = req.user;

    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from Cloudinary
    if (user.avatar && user.avatar.public_id) {
        await cloudinaryDeleteImg(user.avatar.public_id);
    }

    // Upload new avatar using buffer
    const uploaded = await cloudinaryUploadImg(req.file.buffer, 'avatars');

    user.avatar = uploaded;
    await user.save();

    successResponse(res, 200, 'Avatar uploaded successfully', uploaded);
});