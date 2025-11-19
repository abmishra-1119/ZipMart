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
    const { name, email, password, role, storeName } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" });

    const find = await User.findOne({ email });
    if (find) return res.status(400).json({ message: "Email is already registered" });

    const newUser = new User({ name, email, password, role, storeName });
    await newUser.save();

    successResponse(res, 201, "User created successfully", {
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role,
        storeName: newUser.storeName,
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
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return res.status(401).json({ message: "No token provided" });

    let decoded;
    try {
        decoded = jwt.verify(oldToken, process.env.REFRESH_KEY);
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await User.findOne({
        _id: decoded.id,
        "refreshTokens.token": oldToken
    }).lean();

    if (!user) {
        return res.status(403).json({ message: "Invalid token" });
    }

    // generate new tokens
    const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_KEY,
        { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_KEY,
        { expiresIn: "7d" }
    );

    // STEP 1: Remove old refresh token
    await User.updateOne(
        { _id: user._id },
        { $pull: { refreshTokens: { token: oldToken } } }
    );

    // STEP 2: Add new refresh token
    await User.updateOne(
        { _id: user._id },
        {
            $push: {
                refreshTokens: {
                    token: newRefreshToken,
                    userAgent: req.headers["user-agent"],
                    createdAt: new Date()
                }
            }
        }
    );

    // send new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    successResponse(res, 200, "Token refreshed", {
        accessToken: newAccessToken
    });
});

// Get paginated users list
export const getUser = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find({}, "name email age role createdAt avatar ordersCount").skip(skip).limit(limit),
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
    const user = await User.findById(id)
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
    const user = await User.findById(id).select("name email age role cart addresses avatar createdAt updatedAt ordersCount");
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sellers = await User.find({ role: "seller" }).select("name email role storeName productsCount isActive createdAt").skip(skip).limit(limit);
    const totalSeller = await User.countDocuments({ role: "seller" });

    successResponse(res, 200, "All sellers fetched", {
        page,
        limit,
        totalSellers: totalSeller,
        totalPages: Math.ceil(totalSeller / limit),
        sellers,
    });
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

    user.password = newPassword
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

// ADD NEW ADDRESS
export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const address = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // If first address → make default
        if (user.addresses.length === 0) {
            address.isDefault = true;
        }

        user.addresses.push(address);
        await user.save();

        res.status(201).json({
            message: "Address added successfully",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL ADDRESSES
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("addresses");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE ADDRESS
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressIndex = req.params.index;  // Since _id: false

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.addresses[addressIndex]) {
            return res.status(400).json({ message: "Address not found" });
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            ...req.body
        };

        await user.save();

        res.status(200).json({
            message: "Address updated successfully",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE ADDRESS
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressIndex = req.params.index;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.addresses[addressIndex]) {
            return res.status(400).json({ message: "Address not found" });
        }

        const wasDefault = user.addresses[addressIndex].isDefault;

        user.addresses.splice(addressIndex, 1);

        // If deleted default → assign new default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            message: "Address deleted successfully",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SET DEFAULT ADDRESS
export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressIndex = req.params.index;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.addresses[addressIndex]) {
            return res.status(400).json({ message: "Address not found" });
        }

        // Clear all default flags
        user.addresses.forEach(addr => (addr.isDefault = false));

        // Set selected as default
        user.addresses[addressIndex].isDefault = true;

        await user.save();

        res.status(200).json({
            message: "Default address updated",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle user active status (admin only)
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    successResponse(res, 200, `User is now ${user.isActive ? 'active' : 'inactive'}`, {
        id: user._id,
        isActive: user.isActive
    });
});
