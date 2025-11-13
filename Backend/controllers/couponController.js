import Coupon from "../models/Coupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

// Create new coupon
export const createCoupon = asyncHandler(async(req, res) => {
    const { name, discount, expiryDate } = req.body;

    if (!name || !discount) {
        return res.status(400).json({ message: "Name and discount are required" });
    }

    const existingCoupon = await Coupon.findOne({ name });
    if (existingCoupon) {
        return res.status(400).json({ message: "Coupon with this name already exists" });
    }

    const coupon = await Coupon.create({
        name,
        discount,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true
    });

    successResponse(res, 201, "Coupon created successfully", coupon);
});

// Get all coupons with pagination
export const getAllCoupons = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { active } = req.query;
    const filter = {};

    if (active !== undefined) {
        filter.isActive = active === 'true';
    }

    const [coupons, totalCoupons] = await Promise.all([
        Coupon.find(filter)
        .select("name discount expiryDate isActive createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
        Coupon.countDocuments(filter)
    ]);

    successResponse(res, 200, "Coupons fetched successfully", {
        page,
        limit,
        totalCoupons,
        totalPages: Math.ceil(totalCoupons / limit),
        coupons
    });
});

// Get coupon by ID
export const getCouponById = asyncHandler(async(req, res) => {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
    }

    successResponse(res, 200, "Coupon fetched successfully", coupon);
});

// Get coupon by name
export const getCouponByName = asyncHandler(async(req, res) => {
    const { name } = req.params;

    const coupon = await Coupon.findOne({ name });
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isActive) {
        return res.status(400).json({ message: "Coupon is not active" });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return res.status(400).json({ message: "Coupon has expired" });
    }

    successResponse(res, 200, "Coupon fetched successfully", coupon);
});

// Update coupon
export const updateCoupon = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const { name, discount, expiryDate, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
    }

    if (name && name !== coupon.name) {
        const existingCoupon = await Coupon.findOne({ name });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon with this name already exists" });
        }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        // {
        //     ...(name && { name }),
        //     ...(discount && { discount }),
        //     ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        //     ...(isActive !== undefined && { isActive })
        // }
        req.body, { new: true, runValidators: true }
    );

    successResponse(res, 200, "Coupon updated successfully", updatedCoupon);
});

// Delete coupon
export const deleteCoupon = asyncHandler(async(req, res) => {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
    }

    successResponse(res, 200, "Coupon deleted successfully");
});

// Toggle coupon status
export const toggleCouponStatus = asyncHandler(async(req, res) => {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    successResponse(res, 200, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`, coupon);
});

// Validate coupon
export const validateCoupon = asyncHandler(async(req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Coupon name is required" });
    }

    const coupon = await Coupon.findOne({ name });
    if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon" });
    }

    if (!coupon.isActive) {
        return res.status(400).json({ message: "Coupon is not active" });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return res.status(400).json({ message: "Coupon has expired" });
    }

    successResponse(res, 200, "Coupon is valid", {
        name: coupon.name,
        discount: coupon.discount,
        expiryDate: coupon.expiryDate
    });
});

// Get active coupons
export const getActiveCoupons = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentDate = new Date();

    const [coupons, totalCoupons] = await Promise.all([
        Coupon.find({
            isActive: true,
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gt: currentDate } }
            ]
        })
        .select("name discount expiryDate")
        .sort({ discount: -1 })
        .skip(skip)
        .limit(limit),
        Coupon.countDocuments({
            isActive: true,
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gt: currentDate } }
            ]
        })
    ]);

    successResponse(res, 200, "Active coupons fetched successfully", {
        page,
        limit,
        totalCoupons,
        totalPages: Math.ceil(totalCoupons / limit),
        coupons
    });
});