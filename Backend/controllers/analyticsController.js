import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getDateRange } from "../utils/dateRange.js";

// Top Selling Product for Admin
export const getTopSellingProduct = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const range = req.query.range; // 7d, 30d, 90d, 1y
    const skip = (page - 1) * limit;

    const startDate = getDateRange(range);

    const matchStage = startDate
        ? { updatedAt: { $gte: startDate } }
        : {};

    const products = await Product.find(matchStage)
        .select("-__v -updatedAt")
        .sort({ sold: -1 })
        .skip(skip)
        .limit(limit);

    const totalProducts = await Product.countDocuments(matchStage);

    return successResponse(res, 200, "Products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

// Top Selling Product for Seller
export const getTopSellingProductSeller = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const range = req.query.range;
    const skip = (page - 1) * limit;

    const startDate = getDateRange(range);

    const matchStage = {
        sellerId,
        ...(startDate && { updatedAt: { $gte: startDate } })
    };

    const products = await Product.find(matchStage)
        .select("-__v -updatedAt")
        .sort({ sold: -1 })
        .skip(skip)
        .limit(limit);

    const totalProducts = await Product.countDocuments(matchStage);

    return successResponse(res, 200, "Products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

// Total Revenue For Admin
export const getTotalRevenue = asyncHandler(async (req, res) => {
    const range = req.query.range;
    const startDate = getDateRange(range);

    const matchStage = {
        status: "delivered",
        ...(startDate && { orderDate: { $gte: startDate } })
    };

    const orders = await Order.find(matchStage).select("finalPrice");

    const total = orders.reduce((sum, o) => sum + o.finalPrice, 0);

    return successResponse(res, 200, "Total revenue calculated", {
        totalRevenue: total
    });
});

// Total Revenue of a seller
export const getTotalRevenueSeller = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    const range = req.query.range;
    const startDate = getDateRange(range);

    const matchStage = {
        status: "delivered",
        ...(startDate && { orderDate: { $gte: startDate } }),
        "products.sellerId": sellerId
    };

    const orders = await Order.find(matchStage)
        .select("products")
        .populate("products.productId", "price")
        .lean();

    let totalRevenue = 0;

    for (const order of orders) {
        const sellerProducts = order.products.filter(
            p => p.sellerId.toString() === sellerId
        );

        sellerProducts.forEach(item => {
            const price = item.productId.price || 0;
            totalRevenue += price * item.count;
        });
    }

    return successResponse(res, 200, "Total revenue calculated", { totalRevenue });
});

export const getTopCustomers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const range = req.query.range;
    const startDate = getDateRange(range);

    const matchStage = {
        status: "delivered",
        ...(startDate && { orderDate: { $gte: startDate } })
    };

    const orders = await Order.find(matchStage)
        .select("user finalPrice")
        .populate("user", "name email ordersCount")
        .lean();

    const customerMap = {};

    orders.forEach(order => {
        const id = order.user._id.toString();
        if (!customerMap[id]) {
            customerMap[id] = {
                userId: id,
                name: order.user.name,
                email: order.user.email,
                ordersCount: order.user.ordersCount,
                totalOrders: 0,
                totalSpent: 0,
            };
        }
        customerMap[id].totalOrders++;
        customerMap[id].totalSpent += order.finalPrice;
    });

    const topCustomers = Object.values(customerMap)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);

    return successResponse(res, 200, "Top customers fetched", { topCustomers });
});

export const getTopSellers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const range = req.query.range;
    const startDate = getDateRange(range);

    const matchStage = startDate ? { updatedAt: { $gte: startDate } } : {};

    const products = await Product.find(matchStage)
        .select("sellerId sold")
        .populate("sellerId", "name email")
        .lean();

    const sellerMap = {};

    products.forEach(p => {
        const id = p.sellerId?._id?.toString();
        if (!id) return;

        if (!sellerMap[id]) {
            sellerMap[id] = {
                sellerId: id,
                name: p.sellerId.name,
                email: p.sellerId.email,
                totalSold: 0,
            };
        }
        sellerMap[id].totalSold += p.sold || 0;
    });

    const topSellers = Object.values(sellerMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);
    return successResponse(res, 200, "Top sellers fetched", { topSellers });
});

export const getOrderStatusSummary = asyncHandler(async(req, res) => {
    const orders = await Order.find().select("status").lean();

    const statusSummary = {
        pending: 0,
        shipped: 0,
        cancelled: 0,
        delivered: 0,
        refund: 0,
        refunded: 0,
    };

    orders.forEach(order => {
        const status = order.status.toLowerCase();
        if (statusSummary.hasOwnProperty(status)) {
            statusSummary[status]++;
        }
    });
    return successResponse(res, 200, "Order status summary retrieved successfully", {
        totalOrders: orders.length,
        statusSummary,
    });
});