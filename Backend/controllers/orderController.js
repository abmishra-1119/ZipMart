import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

// Create new order with stock validation and coupon discount
export const createOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const { products = [], couponCode, paymentMethod, address } = req.body;

        if (!userId) throw new Error('Unauthorized');
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Products array is required');
        }

        const productIds = products.map(p => p.productId);
        const dbProducts = await Product.find({ _id: { $in: productIds } })
            .select('_id title price stock sellerId')
            .lean();

        if (dbProducts.length !== productIds.length) {
            throw new Error('One or more products not found');
        }

        const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

        let totalPrice = 0;
        const enrichedProducts = [];

        for (const item of products) {
            const product = productMap.get(item.productId.toString());
            if (!product) throw new Error(`Product not found: ${item.productId}`);
            if (item.count > product.stock) {
                throw new Error(`Only ${product.stock} units available for ${product.title}`);
            }

            totalPrice += product.price * item.count;

            enrichedProducts.push({
                productId: item.productId,
                sellerId: product.sellerId,
                count: item.count,
                price: product.price,
            });
        }

        let discount = 0;
        let coupon = null;

        if (couponCode) {
            coupon = await Coupon.findOne({ name: couponCode, isActive: true });

            if (!coupon) {
                throw new Error('Invalid or inactive coupon');
            }

            if (coupon.expiryDate && new Date() > coupon.expiryDate) {
                throw new Error('Coupon has expired');
            }

            discount = Math.min(totalPrice * (coupon.discount / 100), totalPrice);
        }

        const finalPrice = Math.max(0, totalPrice - discount);

        for (const item of enrichedProducts) {
            await Product.findByIdAndUpdate(
                item.productId, { $inc: { stock: -item.count, sold: +item.count } }
            );
        }

        const newOrder = await Order.create({
            user: userId,
            products: enrichedProducts,
            coupon: coupon ? coupon._id : null,
            discount,
            totalPrice,
            finalPrice,
            paymentMethod: paymentMethod || 'COD',
            address,
        });

        await User.findByIdAndUpdate(userId, { $inc: { ordersCount: 1 } });

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders with pagination (admin only)
export const getOrder = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .select('user products orderDate status totalPrice finalPrice paymentMethod discount address')
            .populate('user', 'name email')
            .populate('coupon', 'name discount')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Order.countDocuments();

        res.status(200).json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get Order by User Id
export const getOrdersByUser = async(req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const orders = await Order.find({ user: userId })
            .select('products orderDate status totalPrice finalPrice paymentMethod discount address')
            .populate('products.productId', 'title price thumbnail')
            .populate('coupon', 'name discount')
            .sort({ orderDate: -1 })
            .lean();

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get Order By Id
export const getOrderDetails = async(req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId)
            .select('user products orderDate status totalPrice finalPrice paymentMethod discount address refundProcess refundMsg')
            .populate('user', 'name email phone')
            .populate('coupon', 'name discount')
            .populate('products.productId', 'title price thumbnail')
            .lean();

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders for logged-in user
export const getMyOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const orders = await Order.find({ user: userId })
            .select('products orderDate status totalPrice finalPrice paymentMethod address discount')
            .populate('products.productId', 'title price thumbnail')
            .populate('coupon', 'name discount')
            .sort({ orderDate: -1 })
            .lean();

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders for seller's products
export const getOrdersBySeller = async(req, res) => {
    try {
        const sellerId = req.user.id;
        if (!sellerId) return res.status(401).json({ message: 'Unauthorized' });

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const orders = await Order.find({ 'products.sellerId': sellerId })
            .select('user products orderDate status totalPrice finalPrice discount paymentMethod address')
            .populate('user', 'name email phone')
            .populate('products.productId', 'title price thumbnail')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Order.countDocuments({ 'products.sellerId': sellerId });

        res.status(200).json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (admin/seller)
export const updateOrderStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status, refundProcess, refundMsg } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (refundProcess) updateData.refundProcess = refundProcess;
        if (refundMsg) updateData.refundMsg = refundMsg;

        const order = await Order.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete order (admin only)
export const deleteOrder = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await Order.findByIdAndDelete(id);

        if (!result) return res.status(404).json({ message: 'Order not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel order and restore product stock
export const cancelOrder = async(req, res) => {
    try {
        const userId = req.user.id;
        const { id: orderId } = req.params;

        if (!userId) throw new Error('Unauthorized');

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) throw new Error('Order not found or unauthorized');
        if (order.status !== 'pending') {
            throw new Error(`Cannot cancel order with status: ${order.status}`);
        }

        const updateData = { status: 'cancelled' };

        if (order.paymentMethod !== 'COD') {
            updateData.refundProcess = 'processing';
            updateData.refundTime = new Date();
            updateData.refundMsg = 'Refund will be initiated in 7 working days';
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

        for (const item of order.products) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.count, sold: -item.count } });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update refund status (admin only)
export const updateRefund = async(req, res) => {
    try {
        const { id } = req.params;
        const { refundProcess, refundMsg, status } = req.body;

        const updateData = {};
        if (refundProcess) updateData.refundProcess = refundProcess;
        if (refundMsg) updateData.refundMsg = refundMsg;
        if (status) updateData.status = status;

        const order = await Order.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select('status refundProcess refundMsg refundTime');

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};