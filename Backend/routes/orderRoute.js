import express from 'express'
import {
    cancelOrder,
    createOrder,
    deleteOrder,
    getMyOrder,
    getOrder,
    getOrdersBySeller,
    updateOrderStatus,
    updateRefund,
    getOrderDetails,
    getOrdersByUser,
    getOrdersBySellerId
} from '../controllers/orderController.js'
import { adminMiddleware, authMiddleware, sellerMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - house
 *         - pincode
 *         - city
 *         - state
 *       properties:
 *         house:
 *           type: string
 *           description: House number and building
 *         street:
 *           type: string
 *           description: Street address
 *         landmark:
 *           type: string
 *           description: Nearby landmark
 *         pincode:
 *           type: integer
 *           description: Postal code
 *         city:
 *           type: string
 *           description: City name
 *         state:
 *           type: string
 *           description: State name
 *         country:
 *           type: string
 *           default: India
 *     ProductItem:
 *       type: object
 *       required:
 *         - productId
 *         - count
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID
 *         count:
 *           type: integer
 *           minimum: 1
 *           description: Product quantity
 *     Order:
 *       type: object
 *       required:
 *         - products
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *         user:
 *           type: string
 *           description: User ID
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductItem'
 *         couponCode:
 *           type: string
 *           description: Coupon code for discount
 *         discount:
 *           type: number
 *           minimum: 0
 *           description: Discount amount
 *         totalPrice:
 *           type: number
 *           minimum: 0
 *           description: Total price before discount
 *         finalPrice:
 *           type: number
 *           minimum: 0
 *           description: Final price after discount
 *         orderDate:
 *           type: string
 *           format: date-time
 *           description: Order creation date
 *         paymentMethod:
 *           type: string
 *           enum: [COD, UPI, Credit-Card, Debit-Card, EMI]
 *           default: COD
 *           description: Payment method
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         status:
 *           type: string
 *           enum: [pending, cancelled, delivered, refund, refunded]
 *           default: pending
 *           description: Order status
 *         refundProcess:
 *           type: string
 *           enum: [processing, initiated, cancelled, done]
 *           description: Refund process status
 *         refundTime:
 *           type: string
 *           format: date-time
 *           description: Refund initiation time
 *         refundMsg:
 *           type: string
 *           description: Refund status message
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         order:
 *           $ref: '#/components/schemas/Order'
 *     OrderListResponse:
 *       type: object
 *       properties:
 *         orders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - address
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ProductItem'
 *               couponCode:
 *                 type: string
 *                 example: "SUMMER20"
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, UPI, Credit-Card, Debit-Card, EMI]
 *                 example: "COD"
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid input, missing fields, or insufficient stock
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, createOrder)

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Orders per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/', authMiddleware, adminMiddleware, getOrder)

/**
 * @swagger
 * /orders/user/{id}:
 *   get:
 *     summary: Get orders by user ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:id', authMiddleware, getOrdersByUser)

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authMiddleware, getMyOrder)

/**
 * @swagger
 * /orders/seller:
 *   get:
 *     summary: Get seller's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Orders per page
 *     responses:
 *       200:
 *         description: Seller orders retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller access required
 */
router.get('/seller', authMiddleware, sellerMiddleware, getOrdersBySeller)

/**
 * @swagger
 * /orders/status/{id}:
 *   patch:
 *     summary: Update order status (Seller/Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, cancelled, delivered, refund, refunded]
 *                 example: "delivered"
 *               refundProcess:
 *                 type: string
 *                 enum: [processing, initiated, cancelled, done]
 *                 example: "processing"
 *               refundMsg:
 *                 type: string
 *                 example: "Refund initiated successfully"
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/status/:id', authMiddleware, sellerMiddleware, updateOrderStatus)

/**
 * @swagger
 * /orders/cancel/{id}:
 *   patch:
 *     summary: Cancel order (User)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order in current status
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/cancel/:id', authMiddleware, cancelOrder)

/**
 * @swagger
 * /orders/refund/{id}:
 *   patch:
 *     summary: Update refund status (Seller/Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundProcess:
 *                 type: string
 *                 enum: [processing, initiated, cancelled, done]
 *                 example: "done"
 *               refundMsg:
 *                 type: string
 *                 example: "Refund completed"
 *               status:
 *                 type: string
 *                 enum: [pending, cancelled, delivered, refund, refunded]
 *                 example: "refunded"
 *     responses:
 *       200:
 *         description: Refund status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.put('/refund/:id', authMiddleware, adminMiddleware, updateRefund)

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder)

// get Order By details
router.get('/:id', authMiddleware, getOrderDetails)

// get Order By seller id
router.get('/seller/:id', authMiddleware, adminMiddleware, getOrdersBySellerId)

export default router