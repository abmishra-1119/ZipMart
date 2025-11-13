import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";


// Top Selling Product for Admin
export const getTopSellingProduct = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
        .select("-__v -updatedAt")
        .skip(skip)
        .limit(limit)
        .sort({ sold: -1 })

    const totalProducts = await Product.countDocuments();

    return successResponse(res, 200, "Products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
})

// Top Selling Product for Seller
export const getTopSellingProductSeller = asyncHandler(async(req, res) => {
    const { id } = req.user
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const products = await Product.find({ sellerId: id })
        .select("-__v -updatedAt")
        .skip(skip)
        .limit(limit)
        .sort({ sold: -1 })

    const totalProducts = await Product.countDocuments({ sellerId: id });

    return successResponse(res, 200, "Products fetched successfully", {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
})

// Total Revenue For Admin
export const getTotalRevenue = asyncHandler(async(req, res) => {
    const orders = await Order.find({ status: "delivered" }).select('finalPrice');

    const total = orders.reduce((sum, order) => sum + order.finalPrice, 0);

    successResponse(res, 200, "Total order value calculated", {
        totalOrderValue: total
    })
})

// Total Revenue of a seller
export const getTotalRevenueSeller = asyncHandler(async(req, res) => {
    const sellerId = req.user.id

    const orders = await Order.find({ 'products.sellerId': sellerId, status: 'delivered' })
        .select('products')
        .populate('products.productId', 'price')
        .lean()

    let totalRevenue = 0

    for (const order of orders) {
        const sellerProducts = order.products.filter(
            (p) => p.sellerId.toString() === sellerId.toString()
        )

        for (const item of sellerProducts) {
            const price = item.productId.price || 0
            totalRevenue += price * item.count
        }
    }

    return successResponse(res, 200, 'Total revenue calculated', {
        totalRevenue,
    })
})


export const getTopCustomers = asyncHandler(async(req, res) => {
    const limit = parseInt(req.query.limit) || 5;

    const orders = await Order.find({ status: "delivered" })
        .select("user finalPrice")
        .populate("user", "name email")
        .lean();

    const customerMap = {};

    orders.forEach((order) => {
        const userId = order.user._id.toString();
        console.log(userId);

        if (!customerMap[userId]) {
            customerMap[userId] = {
                userId,
                name: order.user.name,
                email: order.user.email,
                totalOrders: 0,
                totalSpent: 0,
            };
        }
        customerMap[userId].totalOrders += 1;
        customerMap[userId].totalSpent += order.finalPrice;
    });

    console.log(customerMap);

    const topCustomers = Object.values(customerMap)
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, limit);

    successResponse(res, 200, "Top customers retrieved successfully", {
        topCustomers,
    });
});


export const getTopSellers = asyncHandler(async(req, res) => {
    const limit = parseInt(req.query.limit) || 5;

    const products = await Product.find()
        .select("sellerId sold")
        .populate("sellerId", "name email role")
        .lean();

    const sellerMap = {};

    for (const product of products) {
        const sellerId = product.sellerId._id.toString();
        const soldCount = product.sold || 0;

        if (!sellerId) continue;

        if (!sellerMap[sellerId]) {
            sellerMap[sellerId] = {
                sellerId,
                name: product.sellerId.name,
                email: product.sellerId.email,
                totalSold: 0,
            };
        }

        sellerMap[sellerId].totalSold += soldCount;
    }

    const topSellers = Object.values(sellerMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);

    successResponse(res, 200, "Top sellers by sold items retrieved successfully", {
        topSellers,
    });
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