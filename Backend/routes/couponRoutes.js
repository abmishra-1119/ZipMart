import express from 'express'
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    getCouponByName,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getActiveCoupons
} from '../controllers/couponController.js'
import { adminMiddleware, authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       required:
 *         - name
 *         - discount
 *       properties:
 *         _id:
 *           type: string
 *           description: Coupon ID
 *         name:
 *           type: string
 *           description: Unique coupon name/code
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Coupon expiry date
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Coupon active status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CouponResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Coupon'
 *     CouponListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalCoupons:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             coupons:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Create new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - discount
 *             properties:
 *               name:
 *                 type: string
 *                 example: "SUMMER2024"
 *               discount:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       400:
 *         description: Missing fields or coupon already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, adminMiddleware, createCoupon)

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Get all coupons with pagination
 *     tags: [Coupons]
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
 *           default: 10
 *         description: Coupons per page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponListResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, adminMiddleware, getAllCoupons)

/**
 * @swagger
 * /coupons/active:
 *   get:
 *     summary: Get active coupons
 *     tags: [Coupons]
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
 *           default: 10
 *         description: Coupons per page
 *     responses:
 *       200:
 *         description: Active coupons retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponListResponse'
 */
router.get('/active', getActiveCoupons)

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate coupon
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "SUMMER2024"
 *     responses:
 *       200:
 *         description: Coupon is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     discount:
 *                       type: number
 *                     expiryDate:
 *                       type: string
 *       400:
 *         description: Coupon name required or coupon invalid/expired
 *       404:
 *         description: Coupon not found
 */
router.post('/validate', validateCoupon)

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, adminMiddleware, getCouponById)

/**
 * @swagger
 * /coupons/name/{name}:
 *   get:
 *     summary: Get coupon by name
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon name/code
 *     responses:
 *       200:
 *         description: Coupon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       400:
 *         description: Coupon not active or expired
 *       404:
 *         description: Coupon not found
 */
router.get('/name/:name', getCouponByName)

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     summary: Update coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "WINTER2024"
 *               discount:
 *                 type: number
 *                 example: 25
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       400:
 *         description: Coupon name already exists
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon)

/**
 * @swagger
 * /coupons/{id}/toggle:
 *   patch:
 *     summary: Toggle coupon active status (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CouponResponse'
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/toggle', authMiddleware, adminMiddleware, toggleCouponStatus)

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Delete coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon)

export default router